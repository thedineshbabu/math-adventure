/**
 * Authentication Routes
 * Handles user registration, login, logout, and session management
 */

const express = require('express');
const router = express.Router();
const { queryOne, run } = require('../utils/db');
const { generateToken, hashPin, getSessionExpirationDate, isValidEmail, isValidUsername, sanitizeString } = require('../utils/helpers');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Check if player name exists
 * GET /api/auth/check-username
 */
router.get('/check-username', asyncHandler(async (req, res) => {
  const { username } = req.query;
  
  if (!username) {
    return res.status(400).json({ error: 'Player name required' });
  }
  
  const existing = queryOne('SELECT id FROM players WHERE LOWER(username) = LOWER(?)', [sanitizeString(username)]);
  res.json({ exists: !!existing });
}));

/**
 * Register new player
 * POST /api/auth/register
 */
router.post('/register', asyncHandler(async (req, res) => {
  const { username, email, avatar, pin } = req.body;
  
  // Validate required fields
  if (!username || !sanitizeString(username)) {
    return res.status(400).json({ error: 'Player name is required' });
  }
  
  if (!email || !sanitizeString(email)) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  // Validate email format
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }
  
  // Validate PIN
  if (!pin || pin.toString().length < 4) {
    return res.status(400).json({ error: 'PIN must be at least 4 digits' });
  }
  
  // Validate player name format
  if (!isValidUsername(username)) {
    return res.status(400).json({ error: 'Player name must be 3-20 characters (letters, numbers, underscore only)' });
  }
  
  const sanitizedUsername = sanitizeString(username).toLowerCase();
  const sanitizedEmail = sanitizeString(email).toLowerCase();
  
  // Check if player name already exists
  const existingUsername = queryOne('SELECT id FROM players WHERE LOWER(username) = LOWER(?)', [sanitizedUsername]);
  if (existingUsername) {
    return res.status(400).json({ error: 'Player name already taken' });
  }
  
  // Check if email already exists
  const existingEmail = queryOne('SELECT id FROM players WHERE LOWER(email) = LOWER(?)', [sanitizedEmail]);
  if (existingEmail) {
    return res.status(400).json({ error: 'Email already registered' });
  }
  
  // Create player
  const pinHash = hashPin(pin);
  const result = run(
    'INSERT INTO players (username, email, avatar, pin_hash) VALUES (?, ?, ?, ?)',
    [sanitizedUsername, sanitizedEmail, avatar || '🧒', pinHash]
  );
  
  const playerId = result.lastInsertRowid;
  
  // Validate that player was created successfully
  if (!playerId || playerId === null || playerId === undefined) {
    logger.error('Failed to create player: lastInsertRowid is null', { username: sanitizedUsername });
    return res.status(500).json({ error: 'Failed to create player. Please try again.' });
  }
  
  // Create session with validated playerId
  const token = generateToken();
  const expiresAt = getSessionExpirationDate();
  try {
    run(
      'INSERT INTO sessions (player_id, token, expires_at) VALUES (?, ?, ?)',
      [playerId, token, expiresAt]
    );
  } catch (sessionError) {
    logger.error('Failed to create session after player creation', { 
      playerId, 
      error: sessionError.message 
    });
    // If session creation fails, we should clean up the player to maintain data integrity
    run('DELETE FROM players WHERE id = ?', [playerId]);
    return res.status(500).json({ error: 'Failed to create session. Please try again.' });
  }
  
  const player = queryOne('SELECT id, username, avatar FROM players WHERE id = ?', [playerId]);
  
  logger.info('Player registered', { playerId, username: sanitizedUsername });
  
  res.json({
    player,
    token,
    expiresAt
  });
}));

/**
 * Login with player name and PIN
 * POST /api/auth/login
 */
router.post('/login', asyncHandler(async (req, res) => {
  const { username, pin } = req.body;
  
  if (!username || !pin) {
    return res.status(400).json({ error: 'Player name and PIN required' });
  }
  
  const player = queryOne(
    'SELECT id, username, avatar, pin_hash FROM players WHERE LOWER(username) = LOWER(?)',
    [sanitizeString(username)]
  );
  
  if (!player) {
    logger.warn('Login failed: User not found', { username });
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Verify PIN
  if (hashPin(pin) !== player.pin_hash) {
    logger.warn('Login failed: Incorrect PIN', { playerId: player.id });
    return res.status(401).json({ error: 'Incorrect PIN' });
  }
  
  // Validate player ID exists
  if (!player.id) {
    logger.error('Login failed: Player ID is missing', { username });
    return res.status(500).json({ error: 'Invalid player data. Please try again.' });
  }
  
  // Create session
  const token = generateToken();
  const expiresAt = getSessionExpirationDate();
  try {
    run(
      'INSERT INTO sessions (player_id, token, expires_at) VALUES (?, ?, ?)',
      [player.id, token, expiresAt]
    );
  } catch (sessionError) {
    logger.error('Failed to create session during login', { 
      playerId: player.id, 
      error: sessionError.message 
    });
    return res.status(500).json({ error: 'Failed to create session. Please try again.' });
  }
  
  logger.info('Player logged in', { playerId: player.id, username: player.username });
  
  res.json({
    player: { id: player.id, username: player.username, avatar: player.avatar },
    token,
    expiresAt
  });
}));

/**
 * Logout
 * POST /api/auth/logout
 */
router.post('/logout', authMiddleware, asyncHandler(async (req, res) => {
  run('DELETE FROM sessions WHERE token = ?', [req.sessionToken]);
  logger.info('Player logged out', { playerId: req.player.id });
  res.json({ success: true });
}));

/**
 * Get current user
 * GET /api/auth/me
 */
router.get('/me', authMiddleware, asyncHandler(async (req, res) => {
  res.json({ player: req.player });
}));

/**
 * Validate token (for app startup)
 * GET /api/auth/validate
 */
router.get('/validate', optionalAuth, asyncHandler(async (req, res) => {
  if (req.player) {
    res.json({ valid: true, player: req.player });
  } else {
    res.json({ valid: false });
  }
}));

module.exports = router;
