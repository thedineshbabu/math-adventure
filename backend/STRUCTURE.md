# Backend Code Structure

## 📁 Directory Structure

```
backend/
├── routes/              # API route handlers
│   ├── auth.js         # Authentication routes (register, login, logout)
│   ├── problems.js     # Problem generation and submission
│   ├── dailyChallenge.js # Daily challenge routes
│   ├── avatars.js      # Avatar management routes
│   ├── players.js      # Player information routes
│   └── leaderboard.js  # Leaderboard routes
├── middleware/         # Express middleware
│   ├── auth.js        # Authentication middleware
│   └── errorHandler.js # Error handling middleware
├── utils/             # Utility modules
│   ├── constants.js   # Application constants
│   ├── logger.js      # Winston logger configuration
│   ├── db.js          # Database utilities
│   ├── helpers.js     # Helper functions
│   ├── avatarService.js    # Avatar unlock logic
│   ├── problemService.js   # Problem generation logic
│   └── achievementService.js # Achievement checking logic
├── logs/              # Log files (auto-generated)
├── server.js          # Main application entry point
└── package.json       # Dependencies
```

## 🔧 Module Responsibilities

### Routes (`routes/`)
Each route file handles a specific domain:
- **auth.js**: User authentication (register, login, logout, token validation)
- **problems.js**: Math problem generation and answer submission
- **dailyChallenge.js**: Daily challenge management
- **avatars.js**: Avatar selection and unlock status
- **players.js**: Player information and statistics
- **leaderboard.js**: Top players leaderboard

### Middleware (`middleware/`)
- **auth.js**: Token-based authentication middleware
- **errorHandler.js**: Global error handling and async wrapper

### Utilities (`utils/`)
- **constants.js**: All application constants (avatars, config, achievements)
- **logger.js**: Winston logging setup
- **db.js**: Database initialization and query helpers
- **helpers.js**: Common helper functions (token generation, validation, etc.)
- **avatarService.js**: Avatar unlock checking logic
- **problemService.js**: Math problem generation logic
- **achievementService.js**: Achievement checking and XP calculation

## 🚀 Key Improvements

1. **Separation of Concerns**: Each module has a single responsibility
2. **Error Handling**: Centralized error handling with try-catch and async handlers
3. **Logging**: Comprehensive logging with Winston
4. **Maintainability**: Easy to find and modify specific functionality
5. **Testability**: Each module can be tested independently
6. **Scalability**: Easy to add new routes or features

## 📝 Usage Examples

### Adding a New Route
1. Create a new file in `routes/` (e.g., `routes/newFeature.js`)
2. Define routes using Express router
3. Import and mount in `server.js`:
```javascript
const newFeatureRoutes = require('./routes/newFeature');
app.use('/api/new-feature', newFeatureRoutes);
```

### Adding a New Utility Function
1. Add to appropriate utility file or create new service file
2. Export the function
3. Import where needed

### Adding Logging
```javascript
const logger = require('./utils/logger');
logger.info('Message', { context: 'data' });
logger.error('Error message', error);
```

## 🔍 Code Flow

1. **Request** → `server.js` (entry point)
2. **Middleware** → Authentication, logging, etc.
3. **Route Handler** → Processes request
4. **Service/Utility** → Business logic
5. **Database** → Data operations
6. **Response** → JSON response or error

## 📦 Dependencies

- **express**: Web framework
- **cors**: Cross-origin resource sharing
- **sql.js**: SQLite database
- **winston**: Logging library

## 🛠️ Development

### Running the Server
```bash
npm start          # Production mode
npm run dev        # Development mode with watch
```

### Environment Variables
- `PORT`: Server port (default: 3000)
- `DB_PATH`: Database file path (default: math.sqlite)
- `LOG_LEVEL`: Logging level (default: info)
- `NODE_ENV`: Environment (development/production)

## 📊 Logging

Logs are written to:
- `logs/error.log`: Error level logs
- `logs/combined.log`: All logs
- `logs/exceptions.log`: Uncaught exceptions
- `logs/rejections.log**: Unhandled promise rejections

Console output is enabled in development mode.
