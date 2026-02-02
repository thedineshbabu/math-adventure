# 🚀 Local Setup Guide for Math Adventure

## Prerequisites

You need **Node.js 18+** and **npm** installed on your system.

### Install Node.js (Ubuntu/WSL)

**Option 1: Using NodeSource (Recommended)**
```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

**Option 2: Using nvm (No sudo required)**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell or run:
source ~/.bashrc  # or ~/.zshrc

# Install Node.js 18
nvm install 18
nvm use 18

# Verify installation
node --version
npm --version
```

**Option 3: Using snap (if available)**
```bash
sudo snap install node --classic
```

---

## Quick Start (Production Mode)

This builds the frontend and serves everything from the backend server.

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Install frontend dependencies
cd ../frontend
npm install

# 3. Build the frontend
npm run build

# 4. Copy frontend build to backend
mkdir -p ../backend/public
cp -r dist/* ../backend/public/

# 5. Start the server
cd ../backend
npm start
```

The app will be available at: **http://localhost:3000**

---

## Development Mode (Hot Reload)

Run backend and frontend separately for hot reload during development:

**Terminal 1 - Backend:**
```bash
cd backend
npm install  # Only needed first time
npm start    # or npm run dev for auto-reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install  # Only needed first time
npm run dev
```

- Backend API: http://localhost:3000
- Frontend Dev Server: http://localhost:5173

The frontend dev server proxies API requests to the backend automatically.

---

## Using the Startup Script

You can also use the provided startup script:

```bash
chmod +x start.sh
./start.sh
```

This script will:
- Install dependencies if needed
- Build the frontend if needed
- Start the server

---

## Troubleshooting

### Port Already in Use
If port 3000 is already in use:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or set a different port
PORT=3001 npm start
```

### Database Issues
The database file (`backend/math.sqlite`) will be created automatically on first run. If you need to reset:
```bash
rm backend/math.sqlite
# Restart the server - it will create a fresh database
```

### Frontend Build Errors
If you get build errors:
```bash
cd frontend
rm -rf node_modules dist
npm install
npm run build
```

---

## Next Steps

Once running:
1. Open http://localhost:3000 in your browser
2. Create a new player account
3. Start practicing math! 🧮

