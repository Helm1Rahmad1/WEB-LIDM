#!/bin/bash

echo "=========================================="
echo "  SignQuran Backend Quick Start"
echo "=========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please edit .env file with your configuration before continuing."
    echo "Run: nano .env"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build the project
echo "Building TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    echo "Build failed! Please check for errors above."
    exit 1
fi

# Create logs directory
mkdir -p logs

echo ""
echo "=========================================="
echo "  Build completed successfully!"
echo "=========================================="
echo ""
echo "Choose how to run the backend:"
echo "1. Development mode (with hot reload)"
echo "2. Production mode (with PM2)"
echo "3. Production mode (direct node)"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo "Starting in development mode..."
        npm run dev
        ;;
    2)
        echo "Starting with PM2..."
        if ! command -v pm2 &> /dev/null; then
            echo "Installing PM2..."
            npm install -g pm2
        fi
        pm2 start ecosystem.config.js
        pm2 save
        echo ""
        echo "Backend started with PM2!"
        echo "View logs: pm2 logs lidm-backend"
        echo "Monitor: pm2 monit"
        echo "Stop: pm2 stop lidm-backend"
        ;;
    3)
        echo "Starting in production mode..."
        npm start
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac
