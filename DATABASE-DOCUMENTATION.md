# 🗄️ Database Documentation - Sign Quran

## Database: `lidm`
**PostgreSQL Version:** 15

---

## 📊 Database Schema Overview

```
users (Pengguna)
  ├── enrollments → rooms (Pendaftaran kelas)
  │     └── rooms (Kelas)
  │
  ├── user_letter_progress (Progress per huruf)
  │     ├── → hijaiyah
  │     └── → rooms
  │
  ├── user_jilid_progress (Progress per jilid)
  │     ├── → jilid
  │     └── → rooms
  │
  └── letter_tests (Hasil ujian)
        ├── → hijaiyah
        ├── → jilid
        └── → rooms

hijaiyah (Huruf Hijaiyah)
  └── jilid_letters ← jilid (Huruf per jilid)
```

---

## 📋 Tables

### 1. **users** - Data Pengguna

Menyimpan informasi pengguna (guru dan murid).

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| `user_id` | UUID | PRIMARY KEY | ID unik pengguna |
| `name` | VARCHAR(100) | NOT NULL | Nama lengkap |
| `email` | VARCHAR(120) | UNIQUE, NOT NULL | Email (untuk login) |
| `password` | TEXT | NOT NULL | Password (hashed) |
| `role` | user_role | NOT NULL | 'guru' atau 'murid' |
| `verification_token` | VARCHAR(255) | NULL | Token verifikasi email |
| `verification_expires` | TIMESTAMP | NULL | Waktu expired token |
| `is_verified` | BOOLEAN | DEFAULT FALSE | Status verifikasi email |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Waktu registrasi |

**Indexes:**
- Primary: `user_id`
- Unique: `email`

**Example:**
```sql
INSERT INTO users (user_id, name, email, password, role, is_verified) 
VALUES (
  gen_random_uuid(), 
  'John Doe', 
  'john@example.com', 
  '$2b$10$hashedpassword', 
  'murid', 
  true
);
```

---

### 2. **rooms** - Kelas/Ruang Belajar

Menyimpan data kelas yang dibuat oleh guru.

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| `room_id` | SERIAL | PRIMARY KEY | ID kelas |
| `name` | VARCHAR(100) | NOT NULL | Nama kelas |
| `description` | TEXT | NULL | Deskripsi kelas |
| `code` | VARCHAR(10) | UNIQUE, NOT NULL | Kode join (unique) |
| `created_by` | UUID | FK → users | ID guru pembuat |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Waktu dibuat |

**Relationships:**
- `created_by` → `users(user_id)` ON DELETE CASCADE

**Example:**
```sql
INSERT INTO rooms (name, description, code, created_by) 
VALUES ('Kelas Iqra 1', 'Belajar huruf dasar', 'ABC123', 'guru-uuid-here');
```

---

### 3. **enrollments** - Pendaftaran Murid ke Kelas

Menyimpan data murid yang bergabung ke kelas.

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| `enrollment_id` | SERIAL | PRIMARY KEY | ID enrollment |
| `user_id` | UUID | FK → users | ID murid |
| `room_id` | INT | FK → rooms | ID kelas |
| `joined_at` | TIMESTAMP | DEFAULT NOW() | Waktu join |

**Constraints:**
- UNIQUE(`user_id`, `room_id`) - Satu murid tidak bisa join kelas yang sama 2x

**Relationships:**
- `user_id` → `users(user_id)` ON DELETE CASCADE
- `room_id` → `rooms(room_id)` ON DELETE CASCADE

---

### 4. **hijaiyah** - Huruf Hijaiyah

Menyimpan 29 huruf hijaiyah.

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| `hijaiyah_id` | SERIAL | PRIMARY KEY | ID huruf |
| `latin_name` | VARCHAR(50) | NOT NULL | Nama latin (Alif, Ba, Ta, dll) |
| `arabic_char` | VARCHAR(4) | NOT NULL | Karakter Arab (ا, ب, ت) |
| `ordinal` | INT | NOT NULL | Urutan huruf (1-29) |

**Example Data:**
```sql
INSERT INTO hijaiyah (latin_name, arabic_char, ordinal) VALUES
('Alif', 'ا', 1),
('Ba', 'ب', 2),
('Ta', 'ت', 3),
('Tsa', 'ث', 4);
-- ... 25 huruf lainnya
```

---

### 5. **jilid** - Tingkat Belajar

Menyimpan jilid (level) pembelajaran.

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| `jilid_id` | SERIAL | PRIMARY KEY | ID jilid |
| `jilid_name` | VARCHAR(50) | NOT NULL | Nama jilid (Jilid 1, 2, dst) |
| `description` | TEXT | NULL | Deskripsi jilid |

**Example:**
```sql
INSERT INTO jilid (jilid_name, description) VALUES
('Jilid 1', 'Pengenalan huruf dasar'),
('Jilid 2', 'Huruf bersambung'),
('Jilid 3', 'Tanda baca');
```

---

### 6. **jilid_letters** - Mapping Huruf per Jilid

Menyimpan huruf apa saja yang ada di setiap jilid.

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | ID mapping |
| `jilid_id` | INT | FK → jilid | ID jilid |
| `hijaiyah_id` | INT | FK → hijaiyah | ID huruf |
| `sort_order` | INT | DEFAULT 1 | Urutan di jilid |

**Constraints:**
- UNIQUE(`jilid_id`, `hijaiyah_id`) - Satu huruf tidak bisa ada 2x di jilid yang sama

**Example:**
```sql
-- Jilid 1 berisi huruf Alif, Ba, Ta
INSERT INTO jilid_letters (jilid_id, hijaiyah_id, sort_order) VALUES
(1, 1, 1),  -- Alif
(1, 2, 2),  -- Ba
(1, 3, 3);  -- Ta
```

---

### 7. **user_letter_progress** - Progress Belajar per Huruf

Menyimpan progress murid per huruf di kelas tertentu.

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| `progress_id` | BIGSERIAL | PRIMARY KEY | ID progress |
| `user_id` | UUID | FK → users | ID murid |
| `room_id` | INT | FK → rooms | ID kelas |
| `hijaiyah_id` | INT | FK → hijaiyah | ID huruf |
| `status` | VARCHAR(20) | DEFAULT 'belajar' | Status: 'belajar', 'lulus' |
| `last_update` | TIMESTAMP | DEFAULT NOW() | Waktu terakhir update |

**Constraints:**
- UNIQUE(`user_id`, `room_id`, `hijaiyah_id`)

**Status Values:**
- `belajar` - Masih dalam proses belajar
- `lulus` - Sudah lulus/mahir

---

### 8. **user_jilid_progress** - Progress Belajar per Jilid

Menyimpan progress murid per jilid di kelas tertentu.

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| `user_jilid_id` | BIGSERIAL | PRIMARY KEY | ID progress |
| `user_id` | UUID | FK → users | ID murid |
| `room_id` | INT | FK → rooms | ID kelas |
| `jilid_id` | INT | FK → jilid | ID jilid |
| `status` | VARCHAR(20) | DEFAULT 'belajar' | Status jilid |
| `last_update` | TIMESTAMP | DEFAULT NOW() | Waktu update |

**Constraints:**
- UNIQUE(`user_id`, `room_id`, `jilid_id`)

---

### 9. **letter_tests** - Hasil Ujian

Menyimpan hasil ujian/test murid.

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| `test_id` | BIGSERIAL | PRIMARY KEY | ID test |
| `user_id` | UUID | FK → users | ID murid |
| `room_id` | INT | FK → rooms | ID kelas |
| `hijaiyah_id` | INT | FK → hijaiyah | ID huruf yang diuji |
| `jilid_id` | INT | FK → jilid (NULL) | ID jilid (optional) |
| `score` | INT | NOT NULL | Nilai (0-100) |
| `status` | VARCHAR(20) | DEFAULT 'belum_lulus' | Status ujian |
| `tested_at` | TIMESTAMP | DEFAULT NOW() | Waktu ujian |

**Status Values:**
- `belum_lulus` - Nilai < 70
- `lulus` - Nilai >= 70

---

### 10. **user_practice_progress** - Progress Latihan

Menyimpan progress latihan mandiri (tanpa kelas).

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| `practice_id` | BIGSERIAL | PRIMARY KEY | ID practice |
| `user_id` | UUID | FK → users | ID murid |
| `hijaiyah_id` | INT | FK → hijaiyah | ID huruf |
| `status` | VARCHAR(20) | DEFAULT 'belajar' | Status |
| `attempts` | INT | DEFAULT 0 | Jumlah percobaan |
| `last_update` | TIMESTAMP | DEFAULT NOW() | Waktu update |

**Constraints:**
- UNIQUE(`user_id`, `hijaiyah_id`)

---

## 🔍 Useful Queries

### Check Total Users
```sql
SELECT role, COUNT(*) as total 
FROM users 
GROUP BY role;
```

### Get User's Active Rooms
```sql
SELECT r.room_id, r.name, r.code, r.created_at
FROM rooms r
JOIN enrollments e ON r.room_id = e.room_id
WHERE e.user_id = 'user-uuid-here'
ORDER BY e.joined_at DESC;
```

### Get Student Progress in a Room
```sql
SELECT 
  h.latin_name,
  h.arabic_char,
  ulp.status,
  ulp.last_update
FROM user_letter_progress ulp
JOIN hijaiyah h ON ulp.hijaiyah_id = h.hijaiyah_id
WHERE ulp.user_id = 'user-uuid' AND ulp.room_id = 1
ORDER BY h.ordinal;
```

### Get Test Results with Details
```sql
SELECT 
  lt.test_id,
  u.name as student_name,
  h.latin_name as letter,
  j.jilid_name,
  lt.score,
  lt.status,
  lt.tested_at
FROM letter_tests lt
JOIN users u ON lt.user_id = u.user_id
JOIN hijaiyah h ON lt.hijaiyah_id = h.hijaiyah_id
LEFT JOIN jilid j ON lt.jilid_id = j.jilid_id
WHERE lt.room_id = 1
ORDER BY lt.tested_at DESC;
```

### Get Room Statistics
```sql
SELECT 
  r.room_id,
  r.name,
  COUNT(DISTINCT e.user_id) as total_students,
  COUNT(DISTINCT ulp.hijaiyah_id) as letters_learned,
  AVG(lt.score) as avg_score
FROM rooms r
LEFT JOIN enrollments e ON r.room_id = e.room_id
LEFT JOIN user_letter_progress ulp ON r.room_id = ulp.room_id
LEFT JOIN letter_tests lt ON r.room_id = lt.room_id
WHERE r.room_id = 1
GROUP BY r.room_id, r.name;
```

---

## 🛠️ Database Commands

### Connect to Database (via Docker)
```bash
docker exec -it lidm-postgres-docker psql -U postgres -d lidm
```

### List All Tables
```sql
\dt
```

### Describe Table Structure
```sql
\d users
\d rooms
```

### Count Records
```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM rooms;
SELECT COUNT(*) FROM enrollments;
```

### Backup Database
```bash
docker exec lidm-postgres-docker pg_dump -U postgres lidm > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
docker exec -i lidm-postgres-docker psql -U postgres lidm < backup.sql
```

---

## 📝 Notes

1. **UUID for users**: Primary key menggunakan UUID untuk security
2. **SERIAL for auto-increment**: ID kelas, enrollment, dll menggunakan SERIAL
3. **Timestamps**: Semua tabel memiliki created_at atau last_update
4. **Cascading Deletes**: Hapus user/room akan otomatis hapus data terkait
5. **Unique Constraints**: Mencegah duplikasi (email, kode kelas, enrollment)

---

## 🔐 Security Notes

- Password di-hash menggunakan bcrypt
- Verification token untuk email verification
- Role-based access control (guru/murid)
- Foreign key constraints untuk data integrity
