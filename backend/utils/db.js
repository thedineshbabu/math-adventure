/**
 * Database Utilities
 * Handles database initialization, queries, and operations
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const { SERVER_CONFIG } = require('./constants');

let db = null;
const DB_PATH = path.join(__dirname, '..', SERVER_CONFIG.DB_PATH);

/**
 * Initialize database connection and create tables
 * @returns {Promise<void>}
 */
async function initDb() {
  try {
    const SQL = await initSqlJs();
    
    // Load existing DB or create new
    if (fs.existsSync(DB_PATH)) {
      logger.info('Loading existing database from file');
      const buffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(buffer);
    } else {
      logger.info('Creating new database');
      db = new SQL.Database();
    }
    
    // Initialize tables
    db.run(`
      CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
        avatar TEXT DEFAULT '🧒',
        pin_hash TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER NOT NULL,
        token TEXT NOT NULL UNIQUE,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        expires_at TEXT,
        FOREIGN KEY (player_id) REFERENCES players(id)
      );
      
      CREATE TABLE IF NOT EXISTS progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER NOT NULL,
        problem_type TEXT NOT NULL,
        difficulty INTEGER DEFAULT 1,
        correct INTEGER DEFAULT 0,
        total INTEGER DEFAULT 0,
        streak INTEGER DEFAULT 0,
        best_streak INTEGER DEFAULT 0,
        xp INTEGER DEFAULT 0,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (player_id) REFERENCES players(id),
        UNIQUE(player_id, problem_type)
      );
      
      CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER NOT NULL,
        problem TEXT NOT NULL,
        answer TEXT NOT NULL,
        user_answer TEXT,
        correct INTEGER,
        time_ms INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (player_id) REFERENCES players(id)
      );
      
      CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER NOT NULL,
        achievement TEXT NOT NULL,
        unlocked_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (player_id) REFERENCES players(id),
        UNIQUE(player_id, achievement)
      );
      
      CREATE TABLE IF NOT EXISTS daily_challenges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER NOT NULL,
        challenge_date TEXT NOT NULL,
        problems_completed INTEGER DEFAULT 0,
        total_problems INTEGER DEFAULT 5,
        bonus_xp_earned INTEGER DEFAULT 0,
        completed INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (player_id) REFERENCES players(id),
        UNIQUE(player_id, challenge_date)
      );
      
      CREATE TABLE IF NOT EXISTS unlocked_avatars (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER NOT NULL,
        avatar_id TEXT NOT NULL,
        unlocked_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (player_id) REFERENCES players(id),
        UNIQUE(player_id, avatar_id)
      );
      
      CREATE TABLE IF NOT EXISTS fast_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER NOT NULL,
        count INTEGER DEFAULT 0,
        FOREIGN KEY (player_id) REFERENCES players(id),
        UNIQUE(player_id)
      );
    `);
    
    // Add pin_hash column if it doesn't exist (migration for existing DBs)
    try {
      db.run('ALTER TABLE players ADD COLUMN pin_hash TEXT');
      logger.info('Added pin_hash column to players table');
    } catch (e) {
      // Column already exists, ignore error
    }
    
    // Create indexes for better performance
    try {
      db.run('CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)');
      db.run('CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)');
      db.run('CREATE INDEX IF NOT EXISTS idx_progress_player_type ON progress(player_id, problem_type)');
      db.run('CREATE INDEX IF NOT EXISTS idx_history_player_date ON history(player_id, created_at)');
      db.run('CREATE INDEX IF NOT EXISTS idx_daily_challenges_player_date ON daily_challenges(player_id, challenge_date)');
      logger.info('Database indexes created');
    } catch (e) {
      logger.warn('Error creating indexes (may already exist):', e.message);
    }
    
    saveDb();
    
    // Auto-save every 30 seconds
    setInterval(saveDb, SERVER_CONFIG.AUTO_SAVE_INTERVAL_MS);
    
    // Clean expired sessions every hour
    setInterval(() => {
      try {
        run("DELETE FROM sessions WHERE expires_at < datetime('now')");
        logger.debug('Cleaned expired sessions');
      } catch (error) {
        logger.error('Error cleaning expired sessions:', error);
      }
    }, SERVER_CONFIG.SESSION_CLEANUP_INTERVAL_MS);
    
    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Save database to file
 */
function saveDb() {
  try {
    if (db) {
      const data = db.export();
      fs.writeFileSync(DB_PATH, Buffer.from(data));
      logger.debug('Database saved to file');
    }
  } catch (error) {
    logger.error('Error saving database:', error);
  }
}

/**
 * Execute a query and return all results
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Array} Query results
 */
function queryAll(sql, params = []) {
  try {
    if (!db) {
      throw new Error('Database not initialized');
    }
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  } catch (error) {
    logger.error('Database query error:', { sql, params, error: error.message });
    throw error;
  }
}

/**
 * Execute a query and return first result
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Object|null} First result or null
 */
function queryOne(sql, params = []) {
  try {
    const results = queryAll(sql, params);
    return results[0] || null;
  } catch (error) {
    logger.error('Database queryOne error:', { sql, params, error: error.message });
    throw error;
  }
}

/**
 * Execute a write query (INSERT, UPDATE, DELETE)
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Object} Result with lastInsertRowid
 */
function run(sql, params = []) {
  try {
    if (!db) {
      throw new Error('Database not initialized');
    }
    
    // Execute the SQL statement
    db.run(sql, params);
    
    // Get the last insert rowid immediately after the insert
    // This must be called before saveDb() to ensure we get the correct ID
    const result = db.exec("SELECT last_insert_rowid()");
    const lastInsertRowid = result[0]?.values[0]?.[0];
    
    // Convert to number if it's a valid value, otherwise return null
    const rowId = (lastInsertRowid !== null && lastInsertRowid !== undefined) 
      ? Number(lastInsertRowid) 
      : null;
    
    // Save database after successful operation
    saveDb();
    
    logger.debug('Database run executed', { 
      sql: sql.substring(0, 50) + '...', 
      lastInsertRowid: rowId 
    });
    
    return {
      lastInsertRowid: rowId
    };
  } catch (error) {
    logger.error('Database run error:', { sql, params, error: error.message });
    throw error;
  }
}

/**
 * Get database instance (for advanced operations)
 * @returns {Object} Database instance
 */
function getDb() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

module.exports = {
  initDb,
  saveDb,
  queryAll,
  queryOne,
  run,
  getDb,
};
