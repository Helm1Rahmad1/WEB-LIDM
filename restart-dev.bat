@echo off
echo ==========================================
echo   Restarting WEB-LIDM Docker Containers
echo ==========================================
echo.

echo [1/4] Stopping existing containers...
docker-compose down
timeout /t 2 /nobreak >nul

echo [2/4] Removing old containers and images (optional)...
REM Uncomment next line if you want to rebuild from scratch:
REM docker-compose down -v --rmi local

echo [3/4] Building and starting containers...
docker-compose up --build -d

echo [4/4] Waiting for services to be ready...
timeout /t 5 /nobreak >nul

echo.
echo ==========================================
echo   Services Status
echo ==========================================
docker-compose ps
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo Database: localhost:5433
echo.
echo To view logs: docker-compose logs -f
echo To stop: docker-compose down
echo.
pause
