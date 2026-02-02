/**
 * Avatar Routes
 * Handles avatar retrieval and selection
 */

const express = require('express');
const router = express.Router();
const { queryAll, queryOne, run } = require('../utils/db');
const { UNLOCKABLE_AVATARS } = require('../utils/constants');
const { getPlayerStats } = require('../utils/avatarService');
const { authMiddleware } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Get all avatars with unlock status for a player
 * GET /api/avatars
 */
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const playerId = req.player.id;
  const stats = getPlayerStats(playerId);
  
  const unlockedIds = queryAll(
    'SELECT avatar_id FROM unlocked_avatars WHERE player_id = ?',
    [playerId]
  ).map(r => r.avatar_id);
  
  const avatars = UNLOCKABLE_AVATARS.map(avatar => {
    const isUnlocked = !avatar.requirement || unlockedIds.includes(avatar.id);
    let progress = null;
    
    if (avatar.requirement && !isUnlocked) {
      switch (avatar.requirement.type) {
        case 'level':
          progress = { current: stats.level, required: avatar.requirement.value };
          break;
        case 'correct':
          progress = { current: stats.totalCorrect, required: avatar.requirement.value };
          break;
        case 'streak':
          progress = { current: stats.bestStreak, required: avatar.requirement.value };
          break;
        case 'daily':
          progress = { current: stats.dailyChallengesCompleted, required: avatar.requirement.value };
          break;
        case 'accuracy':
          progress = { current: stats.accuracy, required: avatar.requirement.value };
          break;
        case 'xp':
          progress = { current: stats.totalXP, required: avatar.requirement.value };
          break;
        case 'speed':
          progress = { current: stats.fastAnswers, required: avatar.requirement.value };
          break;
      }
    }
    
    return {
      ...avatar,
      unlocked: isUnlocked,
      progress
    };
  });
  
  res.json(avatars);
}));

/**
 * Update player avatar
 * POST /api/avatars/select
 */
router.post('/select', authMiddleware, asyncHandler(async (req, res) => {
  const playerId = req.player.id;
  const { avatarId } = req.body;
  
  const avatar = UNLOCKABLE_AVATARS.find(a => a.id === avatarId);
  if (!avatar) {
    return res.status(400).json({ error: 'Invalid avatar' });
  }
  
  // Check if unlocked
  if (avatar.requirement) {
    const unlocked = queryOne(
      'SELECT 1 FROM unlocked_avatars WHERE player_id = ? AND avatar_id = ?',
      [playerId, avatarId]
    );
    if (!unlocked) {
      return res.status(400).json({ error: 'Avatar not unlocked' });
    }
  }
  
  run('UPDATE players SET avatar = ? WHERE id = ?', [avatar.emoji, playerId]);
  
  logger.info('Avatar selected', { playerId, avatarId });
  
  res.json({ success: true, avatar: avatar.emoji });
}));

module.exports = router;
