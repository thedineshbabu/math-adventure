/**
 * Avatar Service
 * Handles avatar unlocking logic and player stats
 */

const { queryAll, queryOne, run } = require('./db');
const { UNLOCKABLE_AVATARS, GAME_CONFIG } = require('./constants');
const logger = require('./logger');

/**
 * Get player stats for avatar unlocking
 * @param {number} playerId - Player ID
 * @returns {Object} Player statistics
 */
function getPlayerStats(playerId) {
  try {
    const progress = queryAll('SELECT * FROM progress WHERE player_id = ?', [playerId]);
    const dailyStats = queryOne(
      'SELECT COUNT(*) as count FROM daily_challenges WHERE player_id = ? AND completed = 1',
      [playerId]
    );
    const fastAnswersRow = queryOne('SELECT count FROM fast_answers WHERE player_id = ?', [playerId]);
    
    const totalXP = progress.reduce((sum, p) => sum + (p.xp || 0), 0);
    const totalCorrect = progress.reduce((sum, p) => sum + (p.correct || 0), 0);
    const totalProblems = progress.reduce((sum, p) => sum + (p.total || 0), 0);
    const bestStreak = Math.max(0, ...progress.map(p => p.best_streak || 0));
    
    return {
      level: Math.floor(totalXP / GAME_CONFIG.LEVEL_XP_REQUIREMENT) + 1,
      totalXP,
      totalCorrect,
      totalProblems,
      accuracy: totalProblems > 0 ? Math.round((totalCorrect / totalProblems) * 100) : 0,
      bestStreak,
      dailyChallengesCompleted: dailyStats?.count || 0,
      fastAnswers: fastAnswersRow?.count || 0
    };
  } catch (error) {
    logger.error('Error getting player stats:', error);
    throw error;
  }
}

/**
 * Check and unlock avatars based on player stats
 * @param {number} playerId - Player ID
 * @returns {Array} Newly unlocked avatars
 */
function checkAndUnlockAvatars(playerId) {
  try {
    const stats = getPlayerStats(playerId);
    const newlyUnlocked = [];
    
    for (const avatar of UNLOCKABLE_AVATARS) {
      if (!avatar.requirement) continue; // Starter avatars
      
      // Check if already unlocked
      const existing = queryOne(
        'SELECT 1 FROM unlocked_avatars WHERE player_id = ? AND avatar_id = ?',
        [playerId, avatar.id]
      );
      if (existing) continue;
      
      let shouldUnlock = false;
      
      switch (avatar.requirement.type) {
        case 'level':
          shouldUnlock = stats.level >= avatar.requirement.value;
          break;
        case 'correct':
          shouldUnlock = stats.totalCorrect >= avatar.requirement.value;
          break;
        case 'streak':
          shouldUnlock = stats.bestStreak >= avatar.requirement.value;
          break;
        case 'daily':
          shouldUnlock = stats.dailyChallengesCompleted >= avatar.requirement.value;
          break;
        case 'accuracy':
          shouldUnlock = stats.totalProblems >= 50 && stats.accuracy >= avatar.requirement.value;
          break;
        case 'xp':
          shouldUnlock = stats.totalXP >= avatar.requirement.value;
          break;
        case 'speed':
          shouldUnlock = stats.fastAnswers >= avatar.requirement.value;
          break;
      }
      
      if (shouldUnlock) {
        run('INSERT INTO unlocked_avatars (player_id, avatar_id) VALUES (?, ?)', [playerId, avatar.id]);
        newlyUnlocked.push(avatar);
        logger.info('Avatar unlocked', { playerId, avatarId: avatar.id });
      }
    }
    
    return newlyUnlocked;
  } catch (error) {
    logger.error('Error checking avatar unlocks:', error);
    return [];
  }
}

module.exports = {
  getPlayerStats,
  checkAndUnlockAvatars,
};
