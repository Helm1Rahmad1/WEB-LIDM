# 🚀 Quick Reference - Cara Lihat Data di VPS

## 📊 Akses Database

### 1. Connect ke Database
```bash
# Via Docker
docker exec -it lidm-postgres-docker psql -U postgres -d lidm
```

### 2. Basic Commands di PostgreSQL

```sql
-- Lihat semua tabel
\dt

-- Lihat struktur tabel
\d users
\d rooms

-- Keluar
\q
```

---

## 👥 Lihat Data Users

### Semua Users
```sql
SELECT user_id, name, email, role, is_verified, created_at 
FROM users 
ORDER BY created_at DESC;
```

### Users yang Belum Verified
```sql
SELECT name, email, is_verified, verification_expires 
FROM users 
WHERE is_verified = FALSE;
```

### Count Users by Role
```sql
SELECT role, COUNT(*) as total 
FROM users 
GROUP BY role;
```

---

## 🏫 Lihat Data Rooms (Kelas)

### Semua Kelas
```sql
SELECT r.room_id, r.name, r.code, u.name as created_by, r.created_at
FROM rooms r
JOIN users u ON r.created_by = u.user_id
ORDER BY r.created_at DESC;
```

### Kelas dengan Jumlah Murid
```sql
SELECT 
  r.room_id,
  r.name,
  r.code,
  COUNT(e.enrollment_id) as total_students
FROM rooms r
LEFT JOIN enrollments e ON r.room_id = e.room_id
GROUP BY r.room_id, r.name, r.code
ORDER BY total_students DESC;
```

---

## 📚 Lihat Enrollments (Pendaftaran)

### Murid di Kelas Tertentu
```sql
SELECT 
  u.name as student_name,
  u.email,
  e.joined_at
FROM enrollments e
JOIN users u ON e.user_id = u.user_id
WHERE e.room_id = 1  -- Ganti dengan ID kelas
ORDER BY e.joined_at DESC;
```

### Kelas yang Diikuti User
```sql
SELECT 
  r.name as room_name,
  r.code,
  e.joined_at
FROM enrollments e
JOIN rooms r ON e.room_id = r.room_id
WHERE e.user_id = 'user-uuid-here'  -- Ganti dengan UUID user
ORDER BY e.joined_at DESC;
```

---

## 📖 Lihat Data Hijaiyah

### Semua Huruf
```sql
SELECT * FROM hijaiyah ORDER BY ordinal;
```

### Huruf di Jilid Tertentu
```sql
SELECT 
  h.latin_name,
  h.arabic_char,
  jl.sort_order
FROM jilid_letters jl
JOIN hijaiyah h ON jl.hijaiyah_id = h.hijaiyah_id
WHERE jl.jilid_id = 1  -- Jilid 1
ORDER BY jl.sort_order;
```

---

## 📊 Lihat Progress Murid

### Progress Letter di Kelas
```sql
SELECT 
  u.name as student,
  h.latin_name as letter,
  ulp.status,
  ulp.last_update
FROM user_letter_progress ulp
JOIN users u ON ulp.user_id = u.user_id
JOIN hijaiyah h ON ulp.hijaiyah_id = h.hijaiyah_id
WHERE ulp.room_id = 1  -- ID kelas
ORDER BY u.name, h.ordinal;
```

### Progress Summary per Murid
```sql
SELECT 
  u.name,
  COUNT(CASE WHEN ulp.status = 'lulus' THEN 1 END) as lulus,
  COUNT(CASE WHEN ulp.status = 'belajar' THEN 1 END) as belajar,
  COUNT(*) as total
FROM users u
LEFT JOIN user_letter_progress ulp ON u.user_id = ulp.user_id
WHERE u.role = 'murid'
GROUP BY u.user_id, u.name
ORDER BY lulus DESC;
```

---

## ✅ Lihat Hasil Test

### Test Terbaru
```sql
SELECT 
  u.name as student,
  h.latin_name as letter,
  lt.score,
  lt.status,
  lt.tested_at
FROM letter_tests lt
JOIN users u ON lt.user_id = u.user_id
JOIN hijaiyah h ON lt.hijaiyah_id = h.hijaiyah_id
ORDER BY lt.tested_at DESC
LIMIT 10;
```

### Average Score per Student
```sql
SELECT 
  u.name,
  COUNT(lt.test_id) as total_tests,
  AVG(lt.score) as avg_score,
  MIN(lt.score) as min_score,
  MAX(lt.score) as max_score
FROM users u
JOIN letter_tests lt ON u.user_id = lt.user_id
WHERE u.role = 'murid'
GROUP BY u.user_id, u.name
ORDER BY avg_score DESC;
```

---

## 🔍 Quick Checks

### Check User by Email
```sql
SELECT * FROM users WHERE email = 'user@example.com';
```

### Check Room by Code
```sql
SELECT * FROM rooms WHERE code = 'ABC123';
```

### Last 5 Registrations
```sql
SELECT name, email, role, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 5;
```

### Database Size
```sql
SELECT 
  pg_size_pretty(pg_database_size('lidm')) as database_size;
```

### Table Sizes
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🛠️ Maintenance Commands

### Vacuum Database (Clean up)
```sql
VACUUM ANALYZE;
```

### Count All Records
```sql
SELECT 
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'rooms', COUNT(*) FROM rooms
UNION ALL
SELECT 'enrollments', COUNT(*) FROM enrollments
UNION ALL
SELECT 'letter_tests', COUNT(*) FROM letter_tests
UNION ALL
SELECT 'user_letter_progress', COUNT(*) FROM user_letter_progress;
```

---

## 📝 Export Data

### Export to CSV (in psql)
```sql
\copy (SELECT * FROM users) TO '/tmp/users.csv' CSV HEADER
\copy (SELECT * FROM rooms) TO '/tmp/rooms.csv' CSV HEADER
```

### Export via Docker
```bash
# Export single table
docker exec lidm-postgres-docker psql -U postgres -d lidm -c "COPY users TO STDOUT CSV HEADER" > users.csv

# Full database dump
docker exec lidm-postgres-docker pg_dump -U postgres lidm > full_backup.sql
```

---

## 🔐 User Management

### Verify User Manually
```sql
UPDATE users 
SET is_verified = TRUE, 
    verification_token = NULL, 
    verification_expires = NULL
WHERE email = 'user@example.com';
```

### Reset User Password (Manual)
```sql
-- Password harus di-hash dulu via bcrypt
UPDATE users 
SET password = '$2b$10$newhashedpassword'
WHERE email = 'user@example.com';
```

### Delete User
```sql
-- HATI-HATI: Akan menghapus semua data terkait
DELETE FROM users WHERE email = 'user@example.com';
```

---

## 📊 Analytics Queries

### Most Active Students
```sql
SELECT 
  u.name,
  COUNT(DISTINCT ulp.hijaiyah_id) as letters_learned,
  COUNT(DISTINCT lt.test_id) as tests_taken,
  AVG(lt.score) as avg_score
FROM users u
LEFT JOIN user_letter_progress ulp ON u.user_id = ulp.user_id
LEFT JOIN letter_tests lt ON u.user_id = lt.user_id
WHERE u.role = 'murid'
GROUP BY u.user_id, u.name
ORDER BY letters_learned DESC, tests_taken DESC
LIMIT 10;
```

### Room Leaderboard
```sql
SELECT 
  r.name as room,
  u.name as student,
  COUNT(CASE WHEN ulp.status = 'lulus' THEN 1 END) as completed_letters,
  AVG(lt.score) as avg_score
FROM rooms r
JOIN enrollments e ON r.room_id = e.room_id
JOIN users u ON e.user_id = u.user_id
LEFT JOIN user_letter_progress ulp ON u.user_id = ulp.user_id AND r.room_id = ulp.room_id
LEFT JOIN letter_tests lt ON u.user_id = lt.user_id AND r.room_id = lt.room_id
WHERE r.room_id = 1  -- Ganti dengan ID room
GROUP BY r.name, u.user_id, u.name
ORDER BY completed_letters DESC, avg_score DESC;
```

---

## 💡 Tips

1. **Gunakan LIMIT**: Kalau tabel besar, tambahkan `LIMIT 10` atau `LIMIT 100`
2. **Pretty Format**: Di psql, ketik `\x` untuk toggle expanded display
3. **Timing**: Ketik `\timing` untuk melihat query execution time
4. **Save Query**: Simpan query yang sering dipakai di file `.sql`
5. **Transaction**: Gunakan `BEGIN; ... ROLLBACK;` untuk test query tanpa commit

---

## 🚨 Emergency Commands

### Kill Long Running Queries
```sql
-- Lihat active queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
FROM pg_stat_activity 
WHERE state = 'active';

-- Kill specific query
SELECT pg_terminate_backend(pid);
```

### Check Database Connections
```sql
SELECT 
  datname,
  count(*) as connections
FROM pg_stat_activity
GROUP BY datname
ORDER BY connections DESC;
```

---

## 📚 Dokumentasi Lengkap

Lihat dokumentasi detail di:
- `API-DOCUMENTATION.md` - API endpoints
- `DATABASE-DOCUMENTATION.md` - Database schema lengkap
- `DEPLOYMENT.md` - Deployment guide
