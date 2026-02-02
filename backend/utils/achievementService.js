/**
 * Achievement Service
 * Handles achievement checking and unlocking
 */

const { queryOne, run } = require('./db');
const { ACHIEVEMENTS, GAME_CONFIG } = require('./constants');
const logger = require('./logger');

/**
 * Check and unlock achievements based on player stats
 * @param {number} playerId - Player ID
 * @param {Object} stats - Current stats object
 * @returns {Array} Newly unlocked achievements
 */
function checkAchievements(playerId, stats) {
  try {
    const newlyUnlocked = [];
    
    for (const achievement of ACHIEVEMENTS) {
      // Check if achievement condition is met
      if (!achievement.condition(stats)) {
        continue;
      }
      
      // Check if already unlocked
      const exists = queryOne(
        'SELECT 1 FROM achievements WHERE player_id = ? AND achievement = ?',
        [playerId, achievement.id]
      );
      
      if (!exists) {
        run('INSERT INTO achievements (player_id, achievement) VALUES (?, ?)', [playerId, achievement.id]);
        newlyUnlocked.push({
          id: achievement.id,
          name: achievement.name,
          desc: achievement.desc
        });
        logger.info('Achievement unlocked', { playerId, achievementId: achievement.id });
      }
    }
    
    return newlyUnlocked;
  } catch (error) {
    logger.error('Error checking achievements:', error);
    return [];
  }
}

/**
 * Calculate XP gained for a correct answer
 * @param {boolean} isCorrect - Whether answer was correct
 * @param {number} streak - Current streak
 * @param {number} difficulty - Difficulty level
 * @returns {number} XP gained
 */
function calculateXPGained(isCorrect, streak, difficulty) {
  if (!isCorrect) return 0;
  
  const baseXP = GAME_CONFIG.BASE_XP;
  const streakBonus = Math.floor(streak / GAME_CONFIG.STREAK_BONUS_THRESHOLD) * GAME_CONFIG.STREAK_BONUS_MULTIPLIER;
  return (baseXP + streakBonus) * difficulty;
}

module.exports = {
  checkAchievements,
  calculateXPGained,
};
