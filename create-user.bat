@echo off
echo ================================================
echo   LIDM - Quick User Registration (Manual)
echo ================================================
echo.
echo Pastikan Docker containers sedang running!
echo.

set /p NAME="Nama lengkap: "
set /p EMAIL="Email: "
set /p PASSWORD="Password: "
set /p ROLE="Role (guru/murid): "

echo.
echo Creating user...
echo Name: %NAME%
echo Email: %EMAIL%
echo Role: %ROLE%
echo.

REM Hash password dengan bcrypt (simplified - just store plain for testing)
REM In production, password should be hashed!

docker exec -it lidm-postgres-docker psql -U postgres -d lidm -c "INSERT INTO users (name, email, password, role, email_verified) VALUES ('%NAME%', '%EMAIL%', crypt('%PASSWORD%', gen_salt('bf')), '%ROLE%', true) RETURNING user_id, name, email, role;"

echo.
echo ✅ User berhasil dibuat dan email sudah verified!
echo Sekarang Anda bisa login dengan:
echo Email: %EMAIL%
echo Password: %PASSWORD%
echo.
pause
