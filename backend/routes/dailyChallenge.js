/**
 * Daily Challenge Routes
 * Handles daily challenge generation and submission
 */

const express = require('express');
const router = express.Router();
const { queryOne, run } = require('../utils/db');
const { getTodayDate } = require('../utils/helpers');
const { generateDailyChallengeProblems, getDailyChallengeProblem } = require('../utils/problemService');
const { checkAndUnlockAvatars } = require('../utils/avatarService');
const { GAME_CONFIG } = require('../utils/constants');
const { authMiddleware } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Get or create daily challenge for a player
 * GET /api/daily-challenge
 */
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const playerId = req.player.id;
  const today = getTodayDate();
  
  let challenge = queryOne(
    'SELECT * FROM daily_challenges WHERE player_id = ? AND challenge_date = ?',
    [playerId, today]
  );
  
  if (!challenge) {
    run(
      'INSERT INTO daily_challenges (player_id, challenge_date, total_problems) VALUES (?, ?, ?)',
      [playerId, today, GAME_CONFIG.DAILY_CHALLENGE_TOTAL_PROBLEMS]
    );
    challenge = queryOne(
      'SELECT * FROM daily_challenges WHERE player_id = ? AND challenge_date = ?',
      [playerId, today]
    );
  }
  
  // Generate seeded problems for today
  const problems = generateDailyChallengeProblems(today);
  
  logger.debug('Daily challenge retrieved', { playerId, date: today, completed: challenge.completed });
  
  res.json({
    date: today,
    problemsCompleted: challenge.problems_completed,
    totalProblems: challenge.total_problems,
    bonusXpEarned: challenge.bonus_xp_earned,
    completed: !!challenge.completed,
    problems: challenge.completed ? [] : problems.slice(challenge.problems_completed),
    currentProblem: challenge.completed ? null : problems[challenge.problems_completed]
  });
}));

/**
 * Submit daily challenge answer
 * POST /api/daily-challenge/submit
 */
router.post('/submit', authMiddleware, asyncHandler(async (req, res) => {
  const playerId = req.player.id;
  const { answer, problemIndex } = req.body;
  const today = getTodayDate();
  
  const challenge = queryOne(
    'SELECT * FROM daily_challenges WHERE player_id = ? AND challenge_date = ?',
    [playerId, today]
  );
  
  if (!challenge) {
    return res.status(400).json({ error: 'No active daily challenge' });
  }
  
  if (challenge.completed) {
    return res.status(400).json({ error: 'Daily challenge already completed' });
  }
  
  // Regenerate the current problem to verify
  const currentProblem = getDailyChallengeProblem(today, challenge.problems_completed);
  
  if (!currentProblem) {
    return res.status(400).json({ error: 'Invalid problem index' });
  }
  
  const isCorrect = answer.toString().trim() === currentProblem.answer.toString();
  
  if (!isCorrect) {
    logger.debug('Daily challenge answer incorrect', { playerId, problemIndex });
    return res.json({ correct: false, correctAnswer: currentProblem.answer, message: 'Try again tomorrow!' });
  }
  
  // Update progress
  const newCompleted = challenge.problems_completed + 1;
  const bonusXp = GAME_CONFIG.DAILY_CHALLENGE_BONUS_XP_MULTIPLIER * currentProblem.difficulty;
  const isFullyComplete = newCompleted >= challenge.total_problems;
  
  run(
    'UPDATE daily_challenges SET problems_completed = ?, bonus_xp_earned = bonus_xp_earned + ?, completed = ? WHERE player_id = ? AND challenge_date = ?',
    [newCompleted, bonusXp, isFullyComplete ? 1 : 0, playerId, today]
  );
  
  // Add bonus XP to player's progress
  const existing = queryOne('SELECT * FROM progress WHERE player_id = ? AND problem_type = ?', [playerId, currentProblem.type]);
  if (existing) {
    run('UPDATE progress SET xp = xp + ? WHERE player_id = ? AND problem_type = ?', [bonusXp, playerId, currentProblem.type]);
  } else {
    run('INSERT INTO progress (player_id, problem_type, xp) VALUES (?, ?, ?)', [playerId, currentProblem.type, bonusXp]);
  }
  
  // Add completion bonus
  if (isFullyComplete) {
    const completionBonus = GAME_CONFIG.DAILY_CHALLENGE_COMPLETION_BONUS;
    run('UPDATE daily_challenges SET bonus_xp_earned = bonus_xp_earned + ? WHERE player_id = ? AND challenge_date = ?', [completionBonus, playerId, today]);
    if (existing) {
      run('UPDATE progress SET xp = xp + ? WHERE player_id = ? AND problem_type = ?', [completionBonus, playerId, currentProblem.type]);
    } else {
      run('UPDATE progress SET xp = xp + ? WHERE player_id = ? AND problem_type = ?', [completionBonus, playerId, currentProblem.type]);
    }
  }
  
  // Check for new avatar unlocks
  const newAvatars = checkAndUnlockAvatars(playerId);
  
  logger.info('Daily challenge answer submitted', {
    playerId,
    correct: isCorrect,
    completed: isFullyComplete,
    bonusXp
  });
  
  res.json({
    correct: true,
    bonusXp,
    problemsCompleted: newCompleted,
    totalProblems: challenge.total_problems,
    completed: isFullyComplete,
    completionBonus: isFullyComplete ? GAME_CONFIG.DAILY_CHALLENGE_COMPLETION_BONUS : 0,
    newAvatars,
    message: isFullyComplete ? '🎉 Daily Challenge Complete! +100 bonus XP!' : `✨ +${bonusXp} XP!`
  });
}));

/**
 * Get daily challenge stats
 * GET /api/daily-challenge/stats
 */
router.get('/stats', authMiddleware, asyncHandler(async (req, res) => {
  const playerId = req.player.id;
  
  const totalCompleted = queryOne(
    'SELECT COUNT(*) as count FROM daily_challenges WHERE player_id = ? AND completed = 1',
    [playerId]
  );
  
  const totalBonusXp = queryOne(
    'SELECT COALESCE(SUM(bonus_xp_earned), 0) as total FROM daily_challenges WHERE player_id = ?',
    [playerId]
  );
  
  // Calculate current streak
  let streak = 0;
  let checkDate = new Date();
  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const completed = queryOne(
      'SELECT 1 FROM daily_challenges WHERE player_id = ? AND challenge_date = ? AND completed = 1',
      [playerId, dateStr]
    );
    if (completed) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  res.json({
    totalCompleted: totalCompleted?.count || 0,
    totalBonusXp: totalBonusXp?.total || 0,
    currentStreak: streak
  });
}));

module.exports = router;
