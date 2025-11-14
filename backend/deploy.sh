#!/bin/bash

echo "Building backend..."
cd /home/zrill/kuliah/lidm/web/WEB-LIDM/backend

echo "Installing dependencies..."
npm install

echo "Building TypeScript..."
npm run build

echo "Creating logs directory..."
mkdir -p logs

echo "Checking if PM2 is installed..."
if ! command -v pm2 &> /dev/null
then
    echo "PM2 not found. Installing PM2 globally..."
    npm install -g pm2
fi

echo "Starting backend with PM2..."
pm2 start ecosystem.config.js

echo "Saving PM2 configuration..."
pm2 save

echo "Setting up PM2 to start on system boot..."
pm2 startup

echo "Backend deployment completed!"
echo "You can check logs with: pm2 logs lidm-backend"
echo "You can restart with: pm2 restart lidm-backend"
echo "You can stop with: pm2 stop lidm-backend"
