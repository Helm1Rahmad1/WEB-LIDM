@echo off
echo ================================================
echo   LIDM - Reset User Password
echo ================================================
echo.

set /p EMAIL="Email user yang mau di-reset passwordnya: "
set /p NEW_PASSWORD="Password baru: "

echo.
echo Checking user...
docker exec -it lidm-postgres-docker psql -U postgres -d lidm -c "SELECT user_id, name, email, email_verified, role FROM users WHERE email = '%EMAIL%';"

echo.
set /p CONFIRM="Reset password untuk email ini? (y/n): "

if /i "%CONFIRM%"=="y" (
    echo.
    echo Resetting password untuk %EMAIL%...
    
    REM Hash password menggunakan bcrypt di PostgreSQL
    docker exec -it lidm-postgres-docker psql -U postgres -d lidm -c "UPDATE users SET password = crypt('%NEW_PASSWORD%', gen_salt('bf')) WHERE email = '%EMAIL%';"
    
    echo.
    echo ✅ Password berhasil di-reset!
    echo.
    echo Sekarang coba login dengan:
    echo Email: %EMAIL%
    echo Password: %NEW_PASSWORD%
    echo.
) else (
    echo.
    echo ❌ Reset password dibatalkan
)

pause
