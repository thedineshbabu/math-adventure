/**
 * Player Routes
 * Handles player information and statistics
 */

const express = require('express');
const router = express.Router();
const { queryAll, queryOne } = require('../utils/db');
const { GAME_CONFIG } = require('../utils/constants');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Get all players (public info only)
 * GET /api/players
 */
router.get('/', asyncHandler(async (req, res) => {
  const players = queryAll('SELECT id, username, avatar, created_at FROM players ORDER BY username');
  res.json(players);
}));

/**
 * Get player stats
 * GET /api/players/:id/stats
 */
router.get('/:id/stats', asyncHandler(async (req, res) => {
  const playerId = parseInt(req.params.id);
  
  const player = queryOne('SELECT id, username, avatar FROM players WHERE id = ?', [playerId]);
  if (!player) {
    return res.status(404).json({ error: 'Player not found' });
  }
  
  const progress = queryAll('SELECT * FROM progress WHERE player_id = ?', [playerId]);
  const achievements = queryAll('SELECT achievement, unlocked_at FROM achievements WHERE player_id = ?', [playerId]);
  const recentHistory = queryAll(
    'SELECT * FROM history WHERE player_id = ? ORDER BY created_at DESC LIMIT 20',
    [playerId]
  );
  
  const totalXP = progress.reduce((sum, p) => sum + p.xp, 0);
  const totalCorrect = progress.reduce((sum, p) => sum + p.correct, 0);
  const totalProblems = progress.reduce((sum, p) => sum + p.total, 0);
  
  res.json({
    player,
    progress,
    achievements,
    recentHistory,
    summary: {
      totalXP,
      totalCorrect,
      totalProblems,
      accuracy: totalProblems > 0 ? Math.round((totalCorrect / totalProblems) * 100) : 0,
      level: Math.floor(totalXP / GAME_CONFIG.LEVEL_XP_REQUIREMENT) + 1
    }
  });
}));

module.exports = router;
