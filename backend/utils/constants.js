/**
 * Application Constants
 * Centralized configuration and constant values
 */

// Unlockable avatars with requirements
const UNLOCKABLE_AVATARS = [
  // Starter avatars (always unlocked)
  { id: 'kid1', emoji: '🧒', name: 'Kid', requirement: null, unlocked: true },
  { id: 'girl1', emoji: '👧', name: 'Girl', requirement: null, unlocked: true },
  { id: 'boy1', emoji: '👦', name: 'Boy', requirement: null, unlocked: true },
  
  // Level unlocks
  { id: 'superhero', emoji: '🦸', name: 'Superhero', requirement: { type: 'level', value: 3 }, desc: 'Reach Level 3' },
  { id: 'wizard', emoji: '🧙', name: 'Wizard', requirement: { type: 'level', value: 5 }, desc: 'Reach Level 5' },
  { id: 'ninja', emoji: '🥷', name: 'Ninja', requirement: { type: 'level', value: 10 }, desc: 'Reach Level 10' },
  { id: 'king', emoji: '🤴', name: 'King', requirement: { type: 'level', value: 15 }, desc: 'Reach Level 15' },
  { id: 'queen', emoji: '👸', name: 'Queen', requirement: { type: 'level', value: 15 }, desc: 'Reach Level 15' },
  
  // Correct answers unlocks
  { id: 'star', emoji: '⭐', name: 'Star', requirement: { type: 'correct', value: 50 }, desc: 'Get 50 correct answers' },
  { id: 'rocket', emoji: '🚀', name: 'Rocket', requirement: { type: 'correct', value: 100 }, desc: 'Get 100 correct answers' },
  { id: 'trophy', emoji: '🏆', name: 'Champion', requirement: { type: 'correct', value: 250 }, desc: 'Get 250 correct answers' },
  { id: 'diamond', emoji: '💎', name: 'Diamond', requirement: { type: 'correct', value: 500 }, desc: 'Get 500 correct answers' },
  
  // Streak unlocks
  { id: 'fire', emoji: '🔥', name: 'Fire', requirement: { type: 'streak', value: 10 }, desc: 'Get a 10 streak' },
  { id: 'lightning', emoji: '⚡', name: 'Lightning', requirement: { type: 'streak', value: 20 }, desc: 'Get a 20 streak' },
  { id: 'comet', emoji: '☄️', name: 'Comet', requirement: { type: 'streak', value: 30 }, desc: 'Get a 30 streak' },
  
  // Daily challenge unlocks
  { id: 'cat', emoji: '🐱', name: 'Cat', requirement: { type: 'daily', value: 3 }, desc: 'Complete 3 daily challenges' },
  { id: 'dog', emoji: '🐶', name: 'Dog', requirement: { type: 'daily', value: 5 }, desc: 'Complete 5 daily challenges' },
  { id: 'fox', emoji: '🦊', name: 'Fox', requirement: { type: 'daily', value: 10 }, desc: 'Complete 10 daily challenges' },
  { id: 'unicorn', emoji: '🦄', name: 'Unicorn', requirement: { type: 'daily', value: 20 }, desc: 'Complete 20 daily challenges' },
  { id: 'dragon', emoji: '🐉', name: 'Dragon', requirement: { type: 'daily', value: 30 }, desc: 'Complete 30 daily challenges' },
  
  // Special unlocks
  { id: 'alien', emoji: '👽', name: 'Alien', requirement: { type: 'accuracy', value: 95 }, desc: 'Achieve 95% accuracy (min 50 problems)' },
  { id: 'robot', emoji: '🤖', name: 'Robot', requirement: { type: 'speed', value: 20 }, desc: 'Answer 20 problems under 2 seconds each' },
  { id: 'brain', emoji: '🧠', name: 'Brain', requirement: { type: 'xp', value: 5000 }, desc: 'Earn 5000 total XP' },
];

// Server configuration
const SERVER_CONFIG = {
  PORT: process.env.PORT || 3000,
  DB_PATH: process.env.DB_PATH || 'math.sqlite',
  SESSION_EXPIRY_DAYS: 30,
  AUTO_SAVE_INTERVAL_MS: 30000, // 30 seconds
  SESSION_CLEANUP_INTERVAL_MS: 3600000, // 1 hour
};

// XP and difficulty configuration
const GAME_CONFIG = {
  BASE_XP: 10,
  STREAK_BONUS_MULTIPLIER: 5,
  STREAK_BONUS_THRESHOLD: 3,
  FAST_ANSWER_THRESHOLD_MS: 2000,
  DAILY_CHALLENGE_BONUS_XP_MULTIPLIER: 25,
  DAILY_CHALLENGE_COMPLETION_BONUS: 100,
  DAILY_CHALLENGE_TOTAL_PROBLEMS: 5,
  LEVEL_XP_REQUIREMENT: 100,
};

// Achievement definitions
const ACHIEVEMENTS = [
  { id: 'first_correct', condition: (stats) => stats.totalCorrect >= 1, name: '🌟 First Star', desc: 'Got your first correct answer!' },
  { id: 'ten_correct', condition: (stats) => stats.totalCorrect >= 10, name: '⭐ Rising Star', desc: 'Got 10 correct answers!' },
  { id: 'fifty_correct', condition: (stats) => stats.totalCorrect >= 50, name: '🌟 Super Star', desc: 'Got 50 correct answers!' },
  { id: 'hundred_correct', condition: (stats) => stats.totalCorrect >= 100, name: '💫 Math Wizard', desc: 'Got 100 correct answers!' },
  { id: 'streak_5', condition: (stats) => stats.newStreak >= 5, name: '🔥 On Fire', desc: '5 correct in a row!' },
  { id: 'streak_10', condition: (stats) => stats.newStreak >= 10, name: '🔥🔥 Unstoppable', desc: '10 correct in a row!' },
  { id: 'level_5', condition: (stats) => stats.level >= 5, name: '🏆 Level 5', desc: 'Reached level 5!' },
  { id: 'level_10', condition: (stats) => stats.level >= 10, name: '👑 Level 10', desc: 'Reached level 10!' },
  { id: 'speed_demon', condition: (stats) => stats.isCorrect && stats.timeMs < 3000, name: '⚡ Speed Demon', desc: 'Answered correctly in under 3 seconds!' },
];

module.exports = {
  UNLOCKABLE_AVATARS,
  SERVER_CONFIG,
  GAME_CONFIG,
  ACHIEVEMENTS,
};
