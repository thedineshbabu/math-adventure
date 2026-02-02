/**
 * Error Handling Middleware
 * Centralized error handling for the application
 */

const logger = require('../utils/logger');

/**
 * Global error handler middleware
 * Should be the last middleware in the chain
 */
function errorHandler(err, req, res, next) {
  // Log the error
  logger.error('Request error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
  });

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Send error response
  res.status(statusCode).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res) {
  logger.warn('Route not found:', { path: req.path, method: req.method });
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
  });
}

/**
 * Async handler wrapper to catch errors in async route handlers
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped function
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
