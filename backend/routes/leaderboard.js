/**
 * Leaderboard Routes
 * Handles leaderboard generation
 */

const express = require('express');
const router = express.Router();
const { queryAll } = require('../utils/db');
const { GAME_CONFIG } = require('../utils/constants');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Get leaderboard
 * GET /api/leaderboard
 */
router.get('/', asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  
  const toppers = queryAll(`
    SELECT 
      p.id,
      p.username,
      p.avatar,
      COALESCE(SUM(pr.xp), 0) as total_xp,
      COALESCE(SUM(pr.correct), 0) as total_correct,
      COALESCE(SUM(pr.total), 0) as total_problems,
      COALESCE(MAX(pr.best_streak), 0) as best_streak
    FROM players p
    LEFT JOIN progress pr ON p.id = pr.player_id
    GROUP BY p.id
    HAVING total_xp > 0
    ORDER BY total_xp DESC
    LIMIT ?
  `, [limit]);
  
  const leaderboard = toppers.map((player, index) => ({
    rank: index + 1,
    id: player.id,
    username: player.username,
    avatar: player.avatar,
    totalXP: player.total_xp,
    totalCorrect: player.total_correct,
    totalProblems: player.total_problems,
    accuracy: player.total_problems > 0 ? Math.round((player.total_correct / player.total_problems) * 100) : 0,
    level: Math.floor(player.total_xp / GAME_CONFIG.LEVEL_XP_REQUIREMENT) + 1,
    bestStreak: player.best_streak
  }));
  
  logger.debug('Leaderboard retrieved', { limit, count: leaderboard.length });
  
  res.json(leaderboard);
}));

module.exports = router;
