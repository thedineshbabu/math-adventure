/**
 * Authentication Middleware
 * Handles token-based authentication and authorization
 */

const { queryOne } = require('../utils/db');
const logger = require('../utils/logger');

/**
 * Authentication middleware - requires valid token
 * Sets req.player and req.sessionToken if authenticated
 */
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Authentication failed: No token provided', { path: req.path });
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const session = queryOne(
      "SELECT s.*, p.id as player_id, p.username, p.avatar FROM sessions s JOIN players p ON s.player_id = p.id WHERE s.token = ? AND (s.expires_at IS NULL OR s.expires_at > datetime('now'))",
      [token]
    );
    
    if (!session) {
      logger.warn('Authentication failed: Invalid or expired token', { path: req.path });
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    req.player = {
      id: session.player_id,
      username: session.username,
      avatar: session.avatar
    };
    req.sessionToken = token;
    
    logger.debug('Authentication successful', { playerId: req.player.id, username: req.player.username });
    next();
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    return res.status(500).json({ error: 'Authentication error' });
  }
}

/**
 * Optional authentication middleware - doesn't fail if no token
 * Sets req.player if valid token is provided
 */
function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const session = queryOne(
        "SELECT s.*, p.id as player_id, p.username, p.avatar FROM sessions s JOIN players p ON s.player_id = p.id WHERE s.token = ? AND (s.expires_at IS NULL OR s.expires_at > datetime('now'))",
        [token]
      );
      
      if (session) {
        req.player = {
          id: session.player_id,
          username: session.username,
          avatar: session.avatar
        };
        req.sessionToken = token;
        logger.debug('Optional authentication successful', { playerId: req.player.id });
      }
    }
    
    next();
  } catch (error) {
    logger.error('Optional authentication middleware error:', error);
    // Don't fail on optional auth errors, just continue
    next();
  }
}

module.exports = {
  authMiddleware,
  optionalAuth,
};
