@echo off
echo ================================================
echo   Rebuild & Run dengan Live Logs
echo ================================================
echo.

echo [1/2] Rebuilding containers...
docker-compose down
docker-compose up --build -d

echo.
echo [2/2] Showing live logs (Ctrl+C to exit)...
echo Tunggu 5 detik untuk services start...
timeout /t 5 /nobreak >nul

echo.
echo ============ BACKEND LOGS ============
echo Sekarang coba login, dan lihat log di bawah ini:
echo.

docker-compose logs -f backend
