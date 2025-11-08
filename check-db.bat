@echo off
echo ======================================
echo   Checking User in Database
echo ======================================
echo.

echo Connecting to PostgreSQL container...
echo.

docker exec -it lidm-postgres-docker psql -U postgres -d lidm -c "SELECT user_id, name, email, email_verified, role, created_at FROM users WHERE email = 'zril0612@gmail.com';"

echo.
echo ======================================
echo   All Users in Database
echo ======================================
echo.

docker exec -it lidm-postgres-docker psql -U postgres -d lidm -c "SELECT user_id, name, email, email_verified, role FROM users ORDER BY created_at DESC LIMIT 5;"

echo.
echo ======================================
echo   To manually verify email, run:
echo   docker exec -it lidm-postgres-docker psql -U postgres -d lidm
echo   UPDATE users SET email_verified = true WHERE email = 'zril0612@gmail.com';
echo ======================================
echo.
pause
