#!/bin/bash
# Setup script untuk VPS Production
# Jalankan script ini di VPS untuk pertama kali setup

set -e

echo "🚀 Setting up signquran.site on VPS..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    if [ -f .env.server ]; then
        cp .env.server .env
        echo "✅ .env created from .env.server"
    elif [ -f .env.production ]; then
        cp .env.production .env
        echo "✅ .env created from .env.production"
    else
        echo "❌ Error: No .env template found!"
        echo "Please create .env file manually or copy from .env.example"
        exit 1
    fi
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file and change these values:"
    echo "   - JWT_SECRET (use: openssl rand -base64 32)"
    echo "   - DB_PASSWORD"
    echo "   - SMTP_PASS"
    echo ""
    read -p "Press Enter after you've edited .env file..."
fi

# Check if .env has proper values
echo "🔍 Checking .env configuration..."
if grep -q "change-this" .env; then
    echo "⚠️  WARNING: .env still contains 'change-this' placeholder!"
    echo "Please update all sensitive values in .env"
fi

# Check Docker
echo "🐳 Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo "Install Docker first: https://docs.docker.com/engine/install/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed!"
    echo "Install Docker Compose first"
    exit 1
fi
echo "✅ Docker is ready"

# Stop existing containers
echo ""
echo "🛑 Stopping existing containers..."
docker compose down 2>/dev/null || docker-compose down 2>/dev/null || true

# Build images
echo ""
echo "🔨 Building Docker images..."
docker compose build --no-cache || docker-compose build --no-cache

# Start services
echo ""
echo "▶️  Starting services..."
docker compose up -d || docker-compose up -d

# Wait for services
echo ""
echo "⏳ Waiting for services to start (30 seconds)..."
sleep 30

# Check status
echo ""
echo "✅ Checking container status..."
docker compose ps || docker-compose ps

echo ""
echo "🎉 Setup completed!"
echo ""
echo "Next steps:"
echo "1. Setup Nginx reverse proxy (see DEPLOYMENT.md)"
echo "2. Setup SSL certificate with Let's Encrypt"
echo "3. Configure firewall (ports 22, 80, 443)"
echo ""
echo "Check logs with: docker compose logs -f"
echo "Application URL: https://signquran.site"
