@echo off
setlocal enabledelayedexpansion

echo ================================================
echo   LIDM - Manual User Email Verification
echo ================================================
echo.

set /p EMAIL="Masukkan email yang ingin di-verify: "

echo.
echo Checking user with email: %EMAIL%
echo.

docker exec -it lidm-postgres-docker psql -U postgres -d lidm -c "SELECT user_id, name, email, email_verified, role FROM users WHERE email = '%EMAIL%';"

echo.
set /p CONFIRM="Apakah Anda ingin mem-verify email ini? (y/n): "

if /i "%CONFIRM%"=="y" (
    echo.
    echo Verifying email %EMAIL%...
    docker exec -it lidm-postgres-docker psql -U postgres -d lidm -c "UPDATE users SET email_verified = true WHERE email = '%EMAIL%';"
    
    echo.
    echo ✅ Email berhasil di-verify!
    echo.
    echo Cek hasilnya:
    docker exec -it lidm-postgres-docker psql -U postgres -d lidm -c "SELECT user_id, name, email, email_verified, role FROM users WHERE email = '%EMAIL%';"
) else (
    echo.
    echo ❌ Verification dibatalkan
)

echo.
pause
