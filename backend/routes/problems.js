/**
 * Problem Routes
 * Handles math problem generation and answer submission
 */

const express = require('express');
const router = express.Router();
const { queryOne, run } = require('../utils/db');
const { generateProblem } = require('../utils/problemService');
const { checkAchievements, calculateXPGained } = require('../utils/achievementService');
const { checkAndUnlockAvatars } = require('../utils/avatarService');
const { GAME_CONFIG } = require('../utils/constants');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Generate a math problem
 * GET /api/problem
 */
router.get('/problem', asyncHandler(async (req, res) => {
  const { type = 'addition', difficulty = 1, playerId } = req.query;
  
  try {
    const problem = generateProblem(type, difficulty);
    logger.debug('Problem generated', { type, difficulty, playerId });
    res.json(problem);
  } catch (error) {
    logger.error('Error generating problem:', error);
    res.status(400).json({ error: error.message || 'Invalid problem type' });
  }
}));

/**
 * Submit an answer
 * POST /api/submit
 */
router.post('/submit', asyncHandler(async (req, res) => {
  const { playerId, problem, correctAnswer, userAnswer, type, difficulty, timeMs } = req.body;
  
  if (!playerId) {
    return res.status(400).json({ error: 'Player ID required' });
  }
  
  const isCorrect = userAnswer.toString().trim() === correctAnswer.toString().trim();
  
  // Record history
  run(
    'INSERT INTO history (player_id, problem, answer, user_answer, correct, time_ms) VALUES (?, ?, ?, ?, ?, ?)',
    [playerId, problem, correctAnswer, userAnswer, isCorrect ? 1 : 0, timeMs]
  );
  
  // Update progress
  const existing = queryOne('SELECT * FROM progress WHERE player_id = ? AND problem_type = ?', [playerId, type]);
  
  let newStreak, bestStreak, xpGained = 0;
  
  if (existing) {
    newStreak = isCorrect ? existing.streak + 1 : 0;
    bestStreak = Math.max(existing.best_streak, newStreak);
    xpGained = calculateXPGained(isCorrect, newStreak, difficulty);
    
    run(
      'UPDATE progress SET correct = correct + ?, total = total + 1, streak = ?, best_streak = ?, xp = xp + ?, difficulty = ?, updated_at = CURRENT_TIMESTAMP WHERE player_id = ? AND problem_type = ?',
      [isCorrect ? 1 : 0, newStreak, bestStreak, xpGained, difficulty, playerId, type]
    );
  } else {
    newStreak = isCorrect ? 1 : 0;
    bestStreak = newStreak;
    xpGained = calculateXPGained(isCorrect, newStreak, difficulty);
    
    run(
      'INSERT INTO progress (player_id, problem_type, correct, total, streak, best_streak, xp, difficulty) VALUES (?, ?, ?, 1, ?, ?, ?, ?)',
      [playerId, type, isCorrect ? 1 : 0, newStreak, bestStreak, xpGained, difficulty]
    );
  }
  
  // Track fast answers (under threshold)
  if (isCorrect && timeMs < GAME_CONFIG.FAST_ANSWER_THRESHOLD_MS) {
    const fastRow = queryOne('SELECT count FROM fast_answers WHERE player_id = ?', [playerId]);
    if (fastRow) {
      run('UPDATE fast_answers SET count = count + 1 WHERE player_id = ?', [playerId]);
    } else {
      run('INSERT INTO fast_answers (player_id, count) VALUES (?, 1)', [playerId]);
    }
  }
  
  // Check for new avatar unlocks
  const newAvatars = checkAndUnlockAvatars(playerId);
  
  // Check achievements
  const totalCorrectRow = queryOne('SELECT SUM(correct) as total FROM progress WHERE player_id = ?', [playerId]);
  const totalXPRow = queryOne('SELECT SUM(xp) as total FROM progress WHERE player_id = ?', [playerId]);
  const totalCorrect = totalCorrectRow?.total || 0;
  const totalXP = totalXPRow?.total || 0;
  
  const stats = {
    totalCorrect,
    totalXP,
    newStreak,
    isCorrect,
    timeMs,
    level: Math.floor(totalXP / GAME_CONFIG.LEVEL_XP_REQUIREMENT) + 1
  };
  
  const achievements = checkAchievements(playerId, stats);
  
  logger.info('Answer submitted', {
    playerId,
    type,
    isCorrect,
    streak: newStreak,
    xpGained
  });
  
  res.json({
    correct: isCorrect,
    streak: newStreak,
    xpGained,
    newAchievements: achievements,
    newAvatars,
    totalXP,
    level: stats.level
  });
}));

module.exports = router;
