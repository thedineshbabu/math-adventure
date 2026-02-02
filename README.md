# 🧮 Math Adventure

A fun, gamified math practice application designed for kids with player profiles, achievements, progress tracking, and adaptive difficulty. Built with React and Express.js, featuring a modular backend architecture with comprehensive logging and error handling.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Deployment](#deployment)
- [Code Organization](#code-organization)

---

## ✨ Features

### 🎮 Core Gameplay
- **Math Problem Types**: Addition, Subtraction, Multiplication, Division, and Mixed mode
- **Adaptive Difficulty**: Automatically adjusts difficulty (1-5) based on player performance
- **Multiple Game Modes**:
  - **Practice Mode**: Unlimited problems with real-time stats
  - **Timed Mode**: 60-second challenge with score tracking
  - **Daily Challenge**: 5 unique problems per day with bonus XP rewards

### 🏆 Gamification System
- **XP System**: Earn experience points for correct answers
  - Base XP: 10 points × difficulty level
  - Streak bonuses: +5 XP for every 3 consecutive correct answers
  - Daily challenge bonus: 25 XP × difficulty + 100 XP completion bonus
- **Leveling**: Level = `floor(totalXP / 100) + 1`
- **Streaks**: Track consecutive correct answers with visual feedback
- **Achievements**: 10+ achievement types unlocked through gameplay
  - First correct answer, milestones (10, 50, 100 correct)
  - Streak achievements (5, 10 in a row)
  - Level achievements (Level 5, 10)
  - Speed achievements (under 3 seconds)

### 👤 User Management
- **Player Profiles**: Multiple players with unique player names
- **PIN Authentication**: Secure 4+ digit PIN system
- **Avatar System**: 50+ unlockable avatars with various requirements
  - Starter avatars (always unlocked)
  - Level-based unlocks (Level 3, 5, 10, 15)
  - Achievement-based unlocks (correct answers, streaks, accuracy, speed)
  - Daily challenge unlocks
- **Progress Tracking**: Detailed stats per problem type
  - Correct/total answers
  - Current and best streaks
  - XP earned
  - Difficulty level

### 📊 Statistics & Analytics
- **Player Stats**: Comprehensive progress dashboard
  - Total XP and level
  - Overall accuracy percentage
  - Achievement count
  - Recent answer history
- **Leaderboard**: Top players ranked by total XP
- **Daily Challenge Stats**: Streak tracking and completion history

### 🎨 User Interface
- **Modern Design**: Kid-friendly colorful interface
- **Theme Support**: Light and dark mode toggle
- **Responsive**: Works on desktop, tablet, and mobile
- **SVG Background Icons**: Animated floating math-related icons
- **Sound Effects**: Web Audio API for feedback (correct, wrong, streak, achievement)
- **Animations**: Smooth transitions and visual feedback

### 🔒 Security & Reliability
- **Token-Based Authentication**: Secure session management (30-day expiry)
- **Input Validation**: Comprehensive validation for player names, emails, PINs
- **Error Handling**: Centralized error handling with Winston logging
- **Database Safety**: SQLite with automatic backups and error recovery

---

## 🛠️ Tech Stack

### Frontend
- **React 18**: Component-based UI framework
- **Vite**: Build tool and dev server with hot module replacement
- **CSS3**: Custom styling with CSS variables for theming
- **Web Audio API**: Sound effects generation

### Backend
- **Express.js 4.18**: RESTful API server
- **sql.js 1.10**: SQLite database (in-memory, persisted to file)
- **Winston 3.11**: Comprehensive logging system
- **CORS**: Cross-origin resource sharing enabled

### Development Tools
- **Node.js 18+**: Runtime environment
- **npm**: Package management
- **Bash Scripts**: Automated setup and startup (`setup.sh`, `start.sh`)

---

## 🏗️ Architecture

### Backend Architecture (Modular)

The backend follows a modular architecture with clear separation of concerns:

```
backend/
├── routes/              # API route handlers
│   ├── auth.js         # Authentication endpoints
│   ├── problems.js     # Problem generation & submission
│   ├── dailyChallenge.js # Daily challenge management
│   ├── avatars.js      # Avatar management
│   ├── players.js      # Player information
│   └── leaderboard.js  # Leaderboard
├── middleware/         # Express middleware
│   ├── auth.js        # Token authentication
│   └── errorHandler.js # Error handling & async wrapper
├── utils/             # Utility modules
│   ├── constants.js   # App constants & config
│   ├── logger.js      # Winston logger setup
│   ├── db.js          # Database operations
│   ├── helpers.js     # Helper functions
│   ├── avatarService.js    # Avatar unlock logic
│   ├── problemService.js   # Problem generation
│   └── achievementService.js # Achievement checking
└── server.js          # Main entry point
```

### Frontend Architecture

```
frontend/
├── src/
│   ├── components/
│   │   └── BackgroundIcons.jsx # SVG icon components
│   ├── App.jsx        # Main application component
│   ├── main.jsx       # React entry point
│   └── styles.css     # Global styles with theme support
├── dist/             # Production build
└── vite.config.js    # Vite configuration
```

### Data Flow

1. **User Request** → Express server (`server.js`)
2. **Middleware** → Authentication, logging, CORS
3. **Route Handler** → Processes request (e.g., `routes/auth.js`)
4. **Service Layer** → Business logic (e.g., `utils/problemService.js`)
5. **Database Layer** → Data operations (`utils/db.js`)
6. **Response** → JSON response or error

### Database Schema

- **players**: User accounts (player name, email, avatar, PIN hash)
- **sessions**: Authentication tokens with expiration
- **progress**: Per-problem-type statistics (XP, streaks, difficulty)
- **history**: Answer history with timestamps
- **achievements**: Unlocked achievements
- **daily_challenges**: Daily challenge progress
- **unlocked_avatars**: Avatar unlock status
- **fast_answers**: Speed answer tracking

---

## 📁 Project Structure

```
math-app/
├── backend/
│   ├── routes/              # API route handlers
│   ├── middleware/          # Express middleware
│   ├── utils/              # Utility modules & services
│   ├── logs/               # Winston log files (auto-generated)
│   ├── public/             # Frontend build (production)
│   ├── server.js           # Main server entry point
│   ├── math.sqlite         # SQLite database (auto-created)
│   ├── package.json        # Backend dependencies
│   └── STRUCTURE.md        # Backend architecture docs
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   └── BackgroundIcons.jsx
│   │   ├── App.jsx         # Main React component
│   │   ├── main.jsx        # React entry point
│   │   └── styles.css      # Global styles
│   ├── dist/               # Production build
│   ├── index.html          # HTML template
│   ├── vite.config.js      # Vite configuration
│   └── package.json        # Frontend dependencies
├── setup.sh                # Setup script
├── start.sh                # Quick start script
├── IMPROVEMENTS.md         # Improvement suggestions
└── README.md               # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** (check with `node -v`)
- **npm** (comes with Node.js)

### Quick Start

1. **Run the setup script:**
   ```bash
   ./setup.sh
   ```
   This will:
   - Check Node.js installation
   - Install backend and frontend dependencies
   - Build the frontend
   - Copy build to backend/public
   - Create logs directory

2. **Start the server:**
   ```bash
   ./start.sh
   ```
   Or manually:
   ```bash
   cd backend && npm start
   ```

3. **Open in browser:**
   ```
   http://localhost:3000
   ```

### Manual Setup

If you prefer manual setup:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Build frontend
npm run build

# Copy to backend
mkdir -p ../backend/public
cp -r dist/* ../backend/public/

# Start server
cd ../backend
npm start
```

### Development Mode

For development with hot reload:

```bash
# Terminal 1 - Backend
cd backend
npm run dev  # Uses node --watch for auto-reload

# Terminal 2 - Frontend
cd frontend
npm run dev  # Vite dev server with HMR
```

- Backend: http://localhost:3000
- Frontend: http://localhost:5173 (proxies `/api` to backend)

---

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint                   | Auth     | Description                 |
| ------ | -------------------------- | -------- | --------------------------- |
| GET    | `/api/auth/check-username` | No       | Check if player name exists    |
| POST   | `/api/auth/register`       | No       | Register new player         |
| POST   | `/api/auth/login`          | No       | Login with player name/PIN     |
| POST   | `/api/auth/logout`         | Yes      | Logout (invalidate session) |
| GET    | `/api/auth/me`             | Yes      | Get current user            |
| GET    | `/api/auth/validate`       | Optional | Validate token              |

### Game Endpoints

| Method | Endpoint       | Auth | Description                    |
| ------ | -------------- | ---- | ------------------------------ |
| GET    | `/api/problem` | No   | Generate math problem          |
| POST   | `/api/submit`  | No   | Submit answer and get feedback |

**Problem Generation Query Parameters:**
- `type`: `addition`, `subtraction`, `multiplication`, `division`, `mixed`
- `difficulty`: `1-5` (automatically adjusted based on performance)
- `playerId`: Player ID for tracking

**Submit Answer Request Body:**
```json
{
  "playerId": 1,
  "problem": "5 + 3",
  "correctAnswer": "8",
  "userAnswer": "8",
  "type": "addition",
  "difficulty": 1,
  "timeMs": 2500
}
```

### Daily Challenge Endpoints

| Method | Endpoint                      | Auth | Description                   |
| ------ | ----------------------------- | ---- | ----------------------------- |
| GET    | `/api/daily-challenge`        | Yes  | Get today's challenge         |
| POST   | `/api/daily-challenge/submit` | Yes  | Submit daily challenge answer |
| GET    | `/api/daily-challenge/stats`  | Yes  | Get challenge statistics      |

### Avatar Endpoints

| Method | Endpoint              | Auth | Description                        |
| ------ | --------------------- | ---- | ---------------------------------- |
| GET    | `/api/avatars`        | Yes  | Get all avatars with unlock status |
| POST   | `/api/avatars/select` | Yes  | Change player avatar               |

### Player Endpoints

| Method | Endpoint                 | Auth | Description                    |
| ------ | ------------------------ | ---- | ------------------------------ |
| GET    | `/api/players`           | No   | List all players (public info) |
| GET    | `/api/players/:id/stats` | No   | Get player statistics          |

### Leaderboard Endpoint

| Method | Endpoint           | Auth | Description     |
| ------ | ------------------ | ---- | --------------- |
| GET    | `/api/leaderboard` | No   | Get top players |

**Query Parameters:**
- `limit`: Number of players to return (default: 5)

### Health Check

| Method | Endpoint      | Auth | Description         |
| ------ | ------------- | ---- | ------------------- |
| GET    | `/api/health` | No   | Server health check |

---

## 💻 Development

### Code Organization

The project follows a modular architecture:

#### Backend Modules

- **Routes** (`routes/`): Handle HTTP requests and responses
- **Middleware** (`middleware/`): Authentication and error handling
- **Services** (`utils/*Service.js`): Business logic (avatars, problems, achievements)
- **Utilities** (`utils/`): Database, logging, helpers, constants

#### Frontend Components

- **App.jsx**: Main application component with all game logic
- **BackgroundIcons.jsx**: SVG icon components for decorations
- **styles.css**: Global styles with CSS variables for theming

### Key Features Implementation

#### Adaptive Difficulty System
- Tracks last 5 answers per problem type
- Levels up: 4+ correct out of 5, or 3 in a row correct
- Levels down: 3+ wrong out of 5, or 3 in a row wrong
- Difficulty affects problem complexity and XP multiplier

#### Daily Challenge System
- Seeded problem generation (same problems for all players each day)
- Date-based seed ensures consistency
- 5 problems with increasing difficulty
- Bonus XP rewards and streak tracking

#### Avatar Unlock System
- Checks player stats after each answer submission
- Unlocks based on: level, correct answers, streaks, daily challenges, accuracy, speed, total XP
- Progress bars shown for locked avatars

#### Logging System
- Winston logger with multiple transports
- File logging: `logs/error.log`, `logs/combined.log`
- Console logging in development
- Request/response logging middleware
- Exception and rejection handlers (optional)

### Environment Variables

| Variable                    | Default       | Description                                        |
| --------------------------- | ------------- | -------------------------------------------------- |
| `PORT`                      | `3000`        | Server port                                        |
| `DB_PATH`                   | `math.sqlite` | Database file path                                 |
| `LOG_LEVEL`                 | `info`        | Winston log level (error, warn, info, http, debug) |
| `NODE_ENV`                  | `development` | Environment mode                                   |
| `ENABLE_WINSTON_EXCEPTIONS` | -             | Set to `1` to enable exception handlers            |

### Scripts

**Backend:**
- `npm start`: Start server (production)
- `npm run dev`: Start with auto-reload (development)

**Frontend:**
- `npm run dev`: Start Vite dev server
- `npm run build`: Build for production
- `npm run preview`: Preview production build

---

## 🚢 Deployment

### Railway Deployment

1. **Install Railway CLI:**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login:**
   ```bash
   railway login
   ```

3. **Build and deploy:**
   ```bash
   # Build frontend
   cd frontend
   npm install
   npm run build
   mkdir -p ../backend/public
   cp -r dist/* ../backend/public/
   
   # Deploy backend
   cd ../backend
   railway init --name math-app
   railway up
   ```

4. **Get public URL:**
   ```bash
   railway domain
   ```

### Environment Variables (Production)

Set in Railway dashboard:
- `PORT`: Usually auto-set by Railway
- `NODE_ENV`: `production`
- `LOG_LEVEL`: `info` or `warn`

---

## 📝 Code Organization Details

### Backend Structure

See `backend/STRUCTURE.md` for detailed backend architecture documentation.

**Key Principles:**
- Separation of concerns (routes, services, utilities)
- Centralized error handling
- Comprehensive logging
- Database abstraction layer
- Service layer for business logic

### Frontend Structure

- **Single Page Application**: React SPA with client-side routing
- **State Management**: React hooks (useState, useEffect, useCallback)
- **API Communication**: Fetch API with auth headers
- **Local Storage**: Token persistence, sound/theme preferences
- **Component Architecture**: Functional components with hooks

### Recent Improvements

- ✅ Modular backend architecture (routes, middleware, utils)
- ✅ Winston logging system
- ✅ Comprehensive error handling
- ✅ SVG background icons (replaced emojis)
- ✅ Enhanced visibility and styling
- ✅ Database indexes for performance
- ✅ Input validation and sanitization
- ✅ Improved setup and start scripts

---

## 🎯 Key Design Decisions

1. **SQLite Database**: Chosen for simplicity and portability (single file)
2. **Token-Based Auth**: Simple session management suitable for kids' app
3. **Adaptive Difficulty**: Keeps players engaged without frustration
4. **Modular Backend**: Easy to maintain and extend
5. **SVG Icons**: Scalable and themeable, better than emojis
6. **Winston Logging**: Comprehensive logging without external services
7. **Single Server**: Backend serves both API and static frontend files

---

## 🔧 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Change PORT environment variable
PORT=3001 npm start
```

**Database locked:**
- Ensure only one server instance is running
- Check file permissions on `math.sqlite`

**Frontend not loading:**
- Ensure frontend is built: `cd frontend && npm run build`
- Check `backend/public/` contains `index.html`

**Winston permission errors:**
- Logs directory is auto-created
- In sandboxed environments, file logging may be disabled (console only)

---

## 📚 Additional Documentation

- **Backend Structure**: See `backend/STRUCTURE.md`
- **Improvements**: See `IMPROVEMENTS.md` for future enhancements
- **Setup Script**: See `setup.sh` for automated setup

---

## 📄 License

MIT

---

## 🙏 Acknowledgments

Built with ❤️ for young learners to make math practice fun and engaging!
