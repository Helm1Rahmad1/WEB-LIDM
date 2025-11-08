-- Check user status in database
-- Run this in postgres container

-- 1. Check if user exists
SELECT user_id, name, email, email_verified, role, created_at 
FROM users 
WHERE email = 'zril0612@gmail.com';

-- 2. If user exists but not verified, you can manually verify:
UPDATE users 
SET email_verified = true 
WHERE email = 'zril0612@gmail.com';

-- 3. Check all users
SELECT user_id, name, email, email_verified, role 
FROM users 
ORDER BY created_at DESC;
