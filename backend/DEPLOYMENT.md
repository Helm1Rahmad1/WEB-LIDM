# Backend Deployment Guide

## Prerequisites

- Node.js v18 or higher
- PostgreSQL database
- PM2 (will be installed automatically)

## Setup Steps

### 1. Clone Repository and Navigate to Backend

```bash
cd /path/to/WEB-LIDM/backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and edit it:

```bash
cp .env.example .env
nano .env
```

Update the following variables:
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: A secure random string
- `FRONTEND_URL`: Your frontend URL(s), comma-separated
- Email configuration (if using email features)

### 4. Initialize Database

Run the SQL scripts in order:

```bash
psql -U your_username -d your_database -f ../scripts/001_create_database_schema.sql
psql -U your_username -d your_database -f ../scripts/002_seed_hijaiyah_data.sql
psql -U your_username -d your_database -f ../scripts/003_seed_jilid_data.sql
```

Or import the complete database dump:

```bash
psql -U your_username -d your_database < /path/to/lidm.sql
```

### 5. Build the Application

```bash
npm run build
```

### 6. Deploy with PM2

#### Option A: Automatic Deployment

```bash
./deploy.sh
```

#### Option B: Manual Deployment

```bash
# Build the application
npm run build

# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

## PM2 Commands

### Start/Stop/Restart

```bash
pm2 start lidm-backend
pm2 stop lidm-backend
pm2 restart lidm-backend
pm2 delete lidm-backend
```

### View Logs

```bash
pm2 logs lidm-backend
pm2 logs lidm-backend --lines 100
```

### Monitor

```bash
pm2 monit
pm2 status
```

### View Details

```bash
pm2 info lidm-backend
```

## Running Without PM2

For development or testing:

```bash
npm run dev    # Development mode with hot reload
npm run start  # Production mode
```

## SSH Deployment

### 1. Connect to SSH

```bash
ssh user@your-server-ip
```

### 2. Clone or Pull Repository

```bash
cd /home/user
git clone https://github.com/your-repo/WEB-LIDM.git
# or
cd WEB-LIDM && git pull
```

### 3. Setup Backend

```bash
cd WEB-LIDM/backend
cp .env.example .env
nano .env  # Edit configuration
```

### 4. Run Deployment Script

```bash
./deploy.sh
```

## Updating the Application

```bash
cd /home/user/WEB-LIDM
git pull
cd backend
npm install
npm run build
pm2 restart lidm-backend
```

## Troubleshooting

### Check if backend is running

```bash
pm2 status
curl http://localhost:3001/health
```

### View error logs

```bash
pm2 logs lidm-backend --err
tail -f logs/err.log
```

### Reset PM2

```bash
pm2 delete all
pm2 kill
```

### Database connection issues

Check your DATABASE_URL in .env file and ensure PostgreSQL is running:

```bash
sudo systemctl status postgresql
```

### Port already in use

Check what's using port 3001:

```bash
sudo lsof -i :3001
```

Kill the process or change PORT in .env

## Nginx Configuration (Optional)

If you want to use Nginx as reverse proxy:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Save to `/etc/nginx/sites-available/lidm-backend` and enable:

```bash
sudo ln -s /etc/nginx/sites-available/lidm-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## API Documentation

Once running, access Swagger documentation at:

```
http://your-server:3001/api-docs
```

## Security Notes

1. Always use strong JWT_SECRET
2. Keep .env file secure and never commit it
3. Use HTTPS in production
4. Configure firewall to allow only necessary ports
5. Regularly update dependencies: `npm audit fix`
6. Use environment-specific configurations

## Production Checklist

- [ ] Environment variables configured
- [ ] Database initialized with proper data
- [ ] JWT_SECRET is strong and unique
- [ ] CORS configured for production frontend URL
- [ ] PM2 startup configured
- [ ] Logs directory created
- [ ] Firewall configured
- [ ] SSL certificate installed (if using HTTPS)
- [ ] Database backups configured
- [ ] Monitoring setup

## Support

For issues, check:
- PM2 logs: `pm2 logs lidm-backend`
- Application logs: `./logs/combined.log`
- Database connection
- Environment variables
