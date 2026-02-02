/**
 * Problem Service
 * Handles math problem generation and validation
 */

const logger = require('./logger');
const { getDailyChallengeSeed } = require('./helpers');
const { GAME_CONFIG } = require('./constants');

/**
 * Generate a math problem based on type and difficulty
 * @param {string} type - Problem type (addition, subtraction, multiplication, division, mixed)
 * @param {number} difficulty - Difficulty level (1-5)
 * @returns {Object} Problem object with problem string, answer, type, and difficulty
 */
function generateProblem(type, difficulty) {
  try {
    const diff = parseInt(difficulty) || 1;
    let problem, answer;
    const maxNum = diff * 10;
    
    switch (type) {
      case 'addition': {
        const a = Math.floor(Math.random() * maxNum) + 1;
        const b = Math.floor(Math.random() * maxNum) + 1;
        problem = `${a} + ${b}`;
        answer = a + b;
        break;
      }
      case 'subtraction': {
        const a = Math.floor(Math.random() * maxNum) + diff;
        const b = Math.floor(Math.random() * Math.min(a, maxNum)) + 1;
        problem = `${a} - ${b}`;
        answer = a - b;
        break;
      }
      case 'multiplication': {
        const maxMult = Math.min(diff + 2, 12);
        const a = Math.floor(Math.random() * maxMult) + 1;
        const b = Math.floor(Math.random() * maxMult) + 1;
        problem = `${a} × ${b}`;
        answer = a * b;
        break;
      }
      case 'division': {
        const maxDiv = Math.min(diff + 2, 12);
        const b = Math.floor(Math.random() * maxDiv) + 1;
        const answer_val = Math.floor(Math.random() * maxDiv) + 1;
        const a = b * answer_val;
        problem = `${a} ÷ ${b}`;
        answer = answer_val;
        break;
      }
      case 'mixed': {
        const types = ['addition', 'subtraction'];
        if (diff >= 2) types.push('multiplication');
        if (diff >= 3) types.push('division');
        const randomType = types[Math.floor(Math.random() * types.length)];
        return generateProblem(randomType, diff);
      }
      default:
        throw new Error(`Invalid problem type: ${type}`);
    }
    
    return {
      problem,
      answer: answer.toString(),
      type,
      difficulty: diff
    };
  } catch (error) {
    logger.error('Error generating problem:', error);
    throw error;
  }
}

/**
 * Generate daily challenge problems (seeded for consistency)
 * @param {string} date - Date string in YYYY-MM-DD format
 * @returns {Array} Array of problem objects
 */
function generateDailyChallengeProblems(date) {
  try {
    const seed = getDailyChallengeSeed(date);
    const problems = [];
    const types = ['addition', 'subtraction', 'multiplication'];
    
    for (let i = 0; i < GAME_CONFIG.DAILY_CHALLENGE_TOTAL_PROBLEMS; i++) {
      const problemSeed = seed + i;
      const type = types[problemSeed % types.length];
      const difficulty = Math.min(5, Math.floor(i / 1) + 2); // Increasing difficulty
      
      let a, b, problem, answer;
      const maxNum = difficulty * 10;
      
      // Use seed for deterministic random
      const rand = (max) => ((problemSeed * (i + 1) * 9301 + 49297) % 233280) % max + 1;
      
      switch (type) {
        case 'addition':
          a = rand(maxNum);
          b = rand(maxNum);
          problem = `${a} + ${b}`;
          answer = a + b;
          break;
        case 'subtraction':
          a = rand(maxNum) + difficulty;
          b = rand(Math.min(a, maxNum));
          problem = `${a} - ${b}`;
          answer = a - b;
          break;
        case 'multiplication':
          a = rand(Math.min(difficulty + 3, 12));
          b = rand(Math.min(difficulty + 3, 12));
          problem = `${a} × ${b}`;
          answer = a * b;
          break;
      }
      
      problems.push({ index: i, problem, answer: answer.toString(), type, difficulty });
    }
    
    return problems;
  } catch (error) {
    logger.error('Error generating daily challenge problems:', error);
    throw error;
  }
}

/**
 * Get a specific daily challenge problem by index
 * @param {string} date - Date string
 * @param {number} index - Problem index
 * @returns {Object} Problem object
 */
function getDailyChallengeProblem(date, index) {
  try {
    const problems = generateDailyChallengeProblems(date);
    return problems[index] || null;
  } catch (error) {
    logger.error('Error getting daily challenge problem:', error);
    throw error;
  }
}

module.exports = {
  generateProblem,
  generateDailyChallengeProblems,
  getDailyChallengeProblem,
};
