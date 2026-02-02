#!/bin/bash

# Math Adventure - Setup Script
# This script helps set up the application for local development
# Updated for modular backend structure with Winston logging

set -e  # Exit on error

echo "🧮 Math Adventure - Setup Script"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo ""
    echo "Please install Node.js 18+ first:"
    echo ""
    echo "Option 1 (NodeSource - requires sudo):"
    echo "  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "  sudo apt-get install -y nodejs"
    echo ""
    echo "Option 2 (nvm - no sudo):"
    echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "  source ~/.bashrc"
    echo "  nvm install 18"
    echo "  nvm use 18"
    echo ""
    echo "See SETUP.md for more details."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Warning: Node.js version is $NODE_VERSION, but version 18+ is recommended"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ Node.js $(node -v) found"
echo "✅ npm $(npm -v) found"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Verify backend structure exists
echo "🔍 Verifying backend structure..."
if [ ! -d "backend/routes" ] || [ ! -d "backend/middleware" ] || [ ! -d "backend/utils" ]; then
    echo "⚠️  Warning: Backend directory structure not found!"
    echo "   Expected: backend/routes/, backend/middleware/, backend/utils/"
    echo "   Make sure you have the latest code structure."
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ Backend structure verified (routes/, middleware/, utils/)"
fi

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ Error: backend/package.json not found!"
    exit 1
fi

# Install dependencies (including Winston)
if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies (express, cors, sql.js, winston)..."
    npm install
    echo "✅ Backend dependencies installed"
else
    # Check if Winston is installed (new dependency)
    if ! npm list winston &> /dev/null; then
        echo "   Updating dependencies (adding Winston logger)..."
        npm install
        echo "✅ Backend dependencies updated"
    else
        echo "✅ Backend dependencies already installed"
    fi
fi

# Create logs directory for Winston
echo ""
echo "📁 Creating logs directory..."
mkdir -p logs
if [ -d "logs" ]; then
    echo "✅ Logs directory created (backend/logs/)"
else
    echo "⚠️  Warning: Could not create logs directory"
fi

# Verify critical backend files exist
echo ""
echo "🔍 Verifying critical backend files..."
MISSING_FILES=0

if [ ! -f "server.js" ]; then
    echo "❌ Missing: backend/server.js"
    MISSING_FILES=1
fi

if [ ! -f "utils/logger.js" ]; then
    echo "❌ Missing: backend/utils/logger.js"
    MISSING_FILES=1
fi

if [ ! -f "utils/db.js" ]; then
    echo "❌ Missing: backend/utils/db.js"
    MISSING_FILES=1
fi

if [ ! -f "routes/auth.js" ]; then
    echo "❌ Missing: backend/routes/auth.js"
    MISSING_FILES=1
fi

if [ $MISSING_FILES -eq 0 ]; then
    echo "✅ All critical backend files found"
else
    echo "⚠️  Warning: Some critical files are missing!"
    echo "   The application may not work correctly."
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend

if [ ! -f "package.json" ]; then
    echo "❌ Error: frontend/package.json not found!"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    npm install
    echo "✅ Frontend dependencies installed"
else
    echo "✅ Frontend dependencies already installed"
fi

# Build frontend
echo ""
echo "🔨 Building frontend..."
if [ ! -d "dist" ] || [ "src" -nt "dist" ]; then
    npm run build
    echo "✅ Frontend built successfully"
else
    echo "✅ Frontend already built (up to date)"
fi

# Copy frontend to backend
echo ""
echo "📋 Copying frontend build to backend..."
mkdir -p ../backend/public
cp -r dist/* ../backend/public/
echo "✅ Frontend copied to backend/public"

# Final verification
echo ""
echo "🔍 Final verification..."
cd ../backend

# Check if database will be created on first run
if [ ! -f "math.sqlite" ]; then
    echo "ℹ️  Database will be created on first server start"
else
    echo "✅ Database file exists"
fi

# Check if public directory has index.html
if [ -f "public/index.html" ]; then
    echo "✅ Frontend build found in backend/public/"
else
    echo "⚠️  Warning: Frontend build not found in backend/public/"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "📋 Summary:"
echo "   ✅ Backend dependencies installed (including Winston)"
echo "   ✅ Logs directory created"
echo "   ✅ Frontend built and copied"
echo "   ✅ Modular backend structure verified"
echo ""
echo "🚀 To start the server, run:"
echo "   cd backend && npm start"
echo ""
echo "   Or use the start.sh script:"
echo "   ./start.sh"
echo ""
echo "📝 Note: Logs will be written to backend/logs/"
echo "   - error.log: Error level logs"
echo "   - combined.log: All logs"
echo "   - exceptions.log: Uncaught exceptions"
echo ""
