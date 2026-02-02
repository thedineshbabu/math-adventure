#!/bin/bash

# Math Adventure - Start Script
# Quick start script that ensures dependencies and builds are ready

set -e  # Exit on error

cd "$(dirname "$0")"

echo "🧮 Starting Math Adventure..."
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js
if ! command_exists node; then
    echo "❌ Error: Node.js is not installed!"
    echo "   Please run ./setup.sh first to set up the environment."
    exit 1
fi

# Install backend deps if needed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    echo "✅ Backend dependencies installed"
else
    # Check if package.json has been updated (check if winston is in dependencies)
    if grep -q "winston" backend/package.json && [ ! -d "backend/node_modules/winston" ]; then
        echo "📦 Updating backend dependencies (Winston missing)..."
        cd backend
        npm install
        cd ..
    fi
fi

# Create logs directory for Winston (required)
if [ ! -d "backend/logs" ]; then
    echo "📁 Creating logs directory..."
    mkdir -p backend/logs
    echo "✅ Logs directory created"
fi

# Install frontend deps if needed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    echo "✅ Frontend dependencies installed"
fi

# Build frontend if dist doesn't exist or src is newer
NEED_BUILD=false
if [ ! -d "frontend/dist" ]; then
    NEED_BUILD=true
elif [ -d "frontend/src" ] && [ "frontend/src" -nt "frontend/dist" ]; then
    NEED_BUILD=true
fi

if [ "$NEED_BUILD" = true ]; then
    echo "🔨 Building frontend..."
    cd frontend
    npm run build
    cd ..
    echo "✅ Frontend built successfully"
fi

# Copy frontend to backend/public (critical step)
echo "📋 Copying frontend build to backend..."
mkdir -p backend/public

# Check if dist directory has files
if [ -d "frontend/dist" ] && [ "$(ls -A frontend/dist 2>/dev/null)" ]; then
    cp -r frontend/dist/* backend/public/ 2>/dev/null || {
        echo "⚠️  Warning: Could not copy some frontend files"
    }
    echo "✅ Frontend copied to backend/public"
else
    echo "⚠️  Warning: frontend/dist is empty or doesn't exist"
    echo "   The app may not work correctly"
fi

# Verify critical backend files exist
if [ ! -f "backend/server.js" ]; then
    echo "❌ Error: backend/server.js not found!"
    exit 1
fi

if [ ! -f "backend/utils/logger.js" ]; then
    echo "⚠️  Warning: backend/utils/logger.js not found"
    echo "   Make sure you have the latest code structure"
fi

# Verify database will be created if it doesn't exist
if [ ! -f "backend/math.sqlite" ]; then
    echo "ℹ️  Database will be created on first run"
fi

echo ""
echo "🚀 Starting server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start server
cd backend
node server.js
