/**
 * Helper Utility Functions
 * Common helper functions used across the application
 */

const crypto = require('crypto');
const logger = require('./logger');
const { SERVER_CONFIG } = require('./constants');

/**
 * Generate a random authentication token
 * @returns {string} Random hex token
 */
function generateToken() {
  try {
    return crypto.randomBytes(32).toString('hex');
  } catch (error) {
    logger.error('Error generating token:', error);
    throw error;
  }
}

/**
 * Hash PIN using SHA-256
 * Note: For production, consider using bcrypt for better security
 * @param {string|number} pin - PIN to hash
 * @returns {string} Hashed PIN
 */
function hashPin(pin) {
  try {
    return crypto.createHash('sha256').update(pin.toString()).digest('hex');
  } catch (error) {
    logger.error('Error hashing PIN:', error);
    throw error;
  }
}

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} Today's date
 */
function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Generate daily challenge seed based on date
 * Ensures same problems for all players each day
 * @param {string} date - Date string in YYYY-MM-DD format
 * @returns {number} Seed value
 */
function getDailyChallengeSeed(date) {
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    const char = date.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Calculate session expiration date
 * @param {number} days - Number of days until expiration
 * @returns {string} ISO date string
 */
function getSessionExpirationDate(days = SERVER_CONFIG.SESSION_EXPIRY_DAYS) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Get local IP address
 * @returns {string} Local IP address or 'localhost'
 */
function getLocalIP() {
  try {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
    return 'localhost';
  } catch (error) {
    logger.error('Error getting local IP:', error);
    return 'localhost';
  }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate player name format
 * @param {string} username - Player name to validate
 * @returns {boolean} True if valid
 */
function isValidUsername(username) {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Sanitize string input
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(str) {
  if (typeof str !== 'string') {
    return String(str).trim();
  }
  return str.trim();
}

module.exports = {
  generateToken,
  hashPin,
  getTodayDate,
  getDailyChallengeSeed,
  getSessionExpirationDate,
  getLocalIP,
  isValidEmail,
  isValidUsername,
  sanitizeString,
};
