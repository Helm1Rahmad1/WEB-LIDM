#!/bin/bash

# Auto Deploy Script for Sign Quran Platform
# This script will be run on the server after git pull

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Configuration
BACKEND_IMAGE="signquran_api"
FRONTEND_IMAGE="signquran_front"
BACKEND_CONTAINER="signquran_api_7fc9356"
FRONTEND_CONTAINER="signquran_front_7fc9356"
NETWORK_NAME="lidm-network"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Get current git commit hash for tagging
COMMIT_HASH=$(git rev-parse --short HEAD)
print_status "Deploying commit: $COMMIT_HASH"

# Create network if not exists
if ! docker network inspect $NETWORK_NAME >/dev/null 2>&1; then
    print_warning "Network $NETWORK_NAME not found, creating..."
    docker network create $NETWORK_NAME
    print_status "Network created"
fi

# Connect postgres to network if not connected
if ! docker network inspect $NETWORK_NAME | grep -q "lidm-postgres-docker"; then
    print_warning "Connecting postgres to network..."
    docker network connect $NETWORK_NAME lidm-postgres-docker 2>/dev/null || true
    print_status "Postgres connected to network"
fi

# Build backend image
print_status "Building backend image..."
docker build -t $BACKEND_IMAGE:$COMMIT_HASH -t $BACKEND_IMAGE:latest ./backend

# Build frontend image
print_status "Building frontend image..."
docker build -t $FRONTEND_IMAGE:$COMMIT_HASH -t $FRONTEND_IMAGE:latest .

# Stop and remove old containers
print_status "Stopping old containers..."
docker stop $BACKEND_CONTAINER $FRONTEND_CONTAINER 2>/dev/null || true
docker rm $BACKEND_CONTAINER $FRONTEND_CONTAINER 2>/dev/null || true

# Run new backend container
print_status "Starting backend container..."
docker run -d \
  --name $BACKEND_CONTAINER \
  --network $NETWORK_NAME \
  -p 127.0.0.1:30011:3001 \
  -e DB_HOST=lidm-postgres-docker \
  -e DB_PORT=5432 \
  -e DB_NAME=lidm \
  -e DB_USER=postgres \
  -e DB_PASSWORD=postgres \
  -e JWT_SECRET=lidm-jwt-secret-key-change-this-in-production-2024 \
  -e FRONTEND_URL=https://signquran.site \
  -e SMTP_HOST=smtp.gmail.com \
  -e SMTP_PORT=587 \
  -e SMTP_USER=juarasatulidm2025@gmail.com \
  -e SMTP_PASS="rsrl jlfq valq oojm" \
  -e SMTP_FROM=juarasatulidm2025@gmail.com \
  --restart unless-stopped \
  $BACKEND_IMAGE:latest

# Run new frontend container
print_status "Starting frontend container..."
docker run -d \
  --name $FRONTEND_CONTAINER \
  --network $NETWORK_NAME \
  -p 127.0.0.1:30010:3000 \
  -e NEXT_PUBLIC_API_URL=https://signquran.site \
  -e INTERNAL_API_URL=http://$BACKEND_CONTAINER:3001 \
  --restart unless-stopped \
  $FRONTEND_IMAGE:latest

# Wait for containers to start
sleep 5

# Check if containers are running
print_status "Checking container status..."
if docker ps | grep -q $BACKEND_CONTAINER && docker ps | grep -q $FRONTEND_CONTAINER; then
    print_status "Both containers are running!"
    
    # Show logs
    echo ""
    echo "📋 Backend logs (last 10 lines):"
    docker logs --tail 10 $BACKEND_CONTAINER
    
    echo ""
    echo "📋 Frontend logs (last 10 lines):"
    docker logs --tail 10 $FRONTEND_CONTAINER
    
    echo ""
    print_status "Deployment completed successfully! 🎉"
    print_status "Frontend: https://signquran.site"
    print_status "Backend API: https://signquran.site/api"
    print_status "Swagger Docs: https://signquran.site/api-docs"
else
    print_error "Container startup failed!"
    echo "Backend status:"
    docker ps -a | grep $BACKEND_CONTAINER
    echo "Frontend status:"
    docker ps -a | grep $FRONTEND_CONTAINER
    exit 1
fi

# Cleanup old images (optional)
print_status "Cleaning up old images..."
docker image prune -f

echo ""
print_status "Deployment script finished!"
