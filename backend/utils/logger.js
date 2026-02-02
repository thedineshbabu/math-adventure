/**
 * Winston Logger Configuration
 * Centralized logging system for the application
 */

const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
  )
);

// Create logger instance
// Note: exceptionHandlers and rejectionHandlers are disabled by default
// to avoid permission issues in sandboxed environments
// They can be enabled by setting ENABLE_WINSTON_EXCEPTIONS=1
const loggerConfig = {
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports: [],
  // Don't handle exceptions/rejections by default (causes permission issues in sandbox)
  exitOnError: false,
};

// Add file transports only if logs directory is writable
const fs = require('fs');
const logsDir = path.join(__dirname, '../logs');
try {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Test if we can write to the directory
  const testFile = path.join(logsDir, '.test');
  try {
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    
    // Directory is writable, add file transports
    loggerConfig.transports.push(
      new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: path.join(logsDir, 'combined.log'),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      })
    );
    
    // Only enable exception handlers if explicitly enabled
    if (process.env.ENABLE_WINSTON_EXCEPTIONS === '1') {
      loggerConfig.exceptionHandlers = [
        new winston.transports.File({
          filename: path.join(logsDir, 'exceptions.log'),
        }),
      ];
      loggerConfig.rejectionHandlers = [
        new winston.transports.File({
          filename: path.join(logsDir, 'rejections.log'),
        }),
      ];
    }
  } catch (writeError) {
    // Can't write, skip file transports
  }
} catch (error) {
  // Can't create logs directory, skip file transports
}

const logger = winston.createLogger(loggerConfig);

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// Note: Logs directory creation is handled above in logger config

module.exports = logger;
