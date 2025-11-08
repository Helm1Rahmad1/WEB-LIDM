# 📚 Sign Quran - Learning Management System

Platform pembelajaran huruf hijaiyah dengan sistem manajemen kelas dan tracking progress.

## 🌐 Live Demo

**Production:** https://signquran.site

---

## 📖 Dokumentasi

| Dokumentasi | Deskripsi | Link |
|-------------|-----------|------|
| 📡 **API Documentation** | Semua API endpoints dengan contoh request/response | [API-DOCUMENTATION.md](./API-DOCUMENTATION.md) |
| 🗄️ **Database Documentation** | Schema database lengkap dengan relasi | [DATABASE-DOCUMENTATION.md](./DATABASE-DOCUMENTATION.md) |
| 🚀 **Quick Reference** | Cheat sheet untuk query database & command | [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) |
| 🛠️ **Deployment Guide** | Panduan deploy ke VPS dengan Docker | [DEPLOYMENT.md](./DEPLOYMENT.md) |
| ⚡ **Quick Start** | Setup development & production | [QUICKSTART.md](./QUICKSTART.md) |

---

## 🎯 Fitur

### 👨‍🏫 Untuk Guru
- ✅ Membuat kelas dengan kode unik
- ✅ Melihat daftar murid di kelas
- ✅ Monitoring progress belajar murid
- ✅ Melihat hasil ujian murid

### 👨‍🎓 Untuk Murid
- ✅ Join kelas dengan kode
- ✅ Belajar huruf hijaiyah per jilid
- ✅ Tracking progress pembelajaran
- ✅ Mengikuti ujian
- ✅ Lihat history nilai

### 🔐 Authentication
- ✅ Register dengan email verification
- ✅ Login dengan JWT token
- ✅ Role-based access control (Guru/Murid)
- ✅ Password hashing dengan bcrypt

---

## 🏗️ Tech Stack

### Frontend
- **Framework:** Next.js 15
- **UI Library:** React 19
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **HTTP Client:** Axios

### Backend
- **Runtime:** Node.js 20
- **Framework:** Express.js
- **Language:** TypeScript
- **Authentication:** JWT
- **Email:** Nodemailer

### Database
- **Database:** PostgreSQL 15
- **ORM:** Raw SQL with pg
- **Migrations:** SQL scripts

### Infrastructure
- **Containerization:** Docker & Docker Compose
- **Web Server:** Nginx (reverse proxy)
- **SSL:** Let's Encrypt
- **Domain:** signquran.site

---

## 🚀 Quick Start

### Development (Local)

```bash
# Clone repository
git clone https://github.com/Helm1Rahmad1/WEB-LIDM.git
cd WEB-LIDM

# Copy environment file
cp .env.development .env

# Start dengan Docker
docker-compose up -d

# Access
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# Database: localhost:5433
```

### Production (VPS)

```bash
# Di server VPS
git clone <repo-url> /var/www/signquran.site
cd /var/www/signquran.site

# Setup environment
cp .env.production .env
nano .env  # Edit konfigurasi

# Deploy
docker-compose build --no-cache
docker-compose up -d

# Setup Nginx & SSL
sudo cp nginx.conf /etc/nginx/sites-available/signquran.site
sudo ln -s /etc/nginx/sites-available/signquran.site /etc/nginx/sites-enabled/
sudo certbot --nginx -d signquran.site
```

Lihat [DEPLOYMENT.md](./DEPLOYMENT.md) untuk panduan lengkap.

---

## 📁 Project Structure

```
WEB-LIDM/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard (guru & murid)
│   └── api/               # API routes (Next.js)
├── backend/               # Express.js backend
│   └── src/
│       ├── routes/        # API routes
│       ├── middleware/    # Auth middleware
│       ├── services/      # Email services
│       └── config/        # Database config
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── learning/         # Learning components
├── lib/                   # Utilities
│   ├── api-client.ts     # Axios client
│   └── server-auth.ts    # Server-side auth
├── scripts/               # Database scripts
│   ├── 001_init_schema.sql
│   ├── 002_seed_hijaiyah_data.sql
│   ├── 003_seed_jilid_data.sql
│   └── 004_add_email_verification.sql
├── docker-compose.yml     # Docker compose config
├── Dockerfile             # Frontend Dockerfile
└── nginx.conf             # Nginx config
```

---

## 🗄️ Database Schema

### Main Tables

1. **users** - Data pengguna (guru & murid)
2. **rooms** - Kelas/ruang belajar
3. **enrollments** - Pendaftaran murid ke kelas
4. **hijaiyah** - 29 huruf hijaiyah
5. **jilid** - Tingkat pembelajaran
6. **jilid_letters** - Mapping huruf per jilid
7. **user_letter_progress** - Progress belajar per huruf
8. **user_jilid_progress** - Progress belajar per jilid
9. **letter_tests** - Hasil ujian

Lihat [DATABASE-DOCUMENTATION.md](./DATABASE-DOCUMENTATION.md) untuk detail lengkap.

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register              # Register user baru
GET    /api/auth/verify-email          # Verifikasi email
POST   /api/auth/resend-verification   # Kirim ulang email verifikasi
POST   /api/auth/login                 # Login
POST   /api/auth/logout                # Logout
GET    /api/auth/me                    # Get current user
```

### Rooms (Kelas)
```
GET    /api/rooms                      # Get user's rooms
POST   /api/rooms                      # Create room (guru only)
POST   /api/rooms/join                 # Join room (murid only)
GET    /api/rooms/:id/students         # Get students (guru only)
```

### Progress
```
GET    /api/progress/letter            # Get letter progress
GET    /api/progress/jilid             # Get jilid progress
POST   /api/progress/letter            # Update letter progress
```

### Tests
```
GET    /api/tests                      # Get test results
POST   /api/tests                      # Submit test result
```

### Hijaiyah & Jilid
```
GET    /api/hijaiyah                   # Get all letters
GET    /api/hijaiyah/:id               # Get single letter
GET    /api/jilid                      # Get all jilid
GET    /api/jilid/:id                  # Get single jilid
GET    /api/jilid/:id/letters          # Get letters in jilid
```

Lihat [API-DOCUMENTATION.md](./API-DOCUMENTATION.md) untuk detail lengkap.

---

## 🛠️ Development

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15 (via Docker)

### Environment Variables

**Frontend (.env):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Backend (.env):**
```env
DB_HOST=postgres
DB_PORT=5432
DB_NAME=lidm
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Build & Run

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Database Commands

```bash
# Connect to database
docker exec -it lidm-postgres-docker psql -U postgres -d lidm

# Run migration
docker exec -i lidm-postgres-docker psql -U postgres -d lidm < scripts/001_init_schema.sql

# Backup database
docker exec lidm-postgres-docker pg_dump -U postgres lidm > backup.sql

# Restore database
docker exec -i lidm-postgres-docker psql -U postgres lidm < backup.sql
```

Lihat [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) untuk command lengkap.

---

## 🔍 Monitoring

### Check Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Check Status
```bash
# Container status
docker-compose ps

# Database connections
docker exec lidm-postgres-docker psql -U postgres -d lidm -c "SELECT count(*) FROM pg_stat_activity;"
```

### Check Application
```bash
# Health check
curl https://signquran.site
curl https://signquran.site/api/hijaiyah
```

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check if postgres is running
docker-compose ps postgres

# Restart postgres
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Email Verification Not Working
```bash
# Check backend logs
docker-compose logs backend | grep -i email

# Check SMTP settings in .env
cat .env | grep SMTP
```

### Build Error
```bash
# Clean build
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

Lihat troubleshooting section di [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## 📊 Database Access

### View Data
```sql
-- Connect
docker exec -it lidm-postgres-docker psql -U postgres -d lidm

-- View users
SELECT * FROM users ORDER BY created_at DESC LIMIT 5;

-- View rooms
SELECT * FROM rooms ORDER BY created_at DESC;

-- View progress
SELECT u.name, h.latin_name, ulp.status 
FROM user_letter_progress ulp
JOIN users u ON ulp.user_id = u.user_id
JOIN hijaiyah h ON ulp.hijaiyah_id = h.hijaiyah_id
LIMIT 10;
```

Lihat [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) untuk query lengkap.

---

## 🔐 Security

- ✅ Password di-hash dengan bcrypt (salt rounds: 10)
- ✅ JWT token untuk authentication
- ✅ Email verification untuk user baru
- ✅ Role-based access control
- ✅ HTTPS dengan SSL certificate
- ✅ Environment variables untuk sensitive data
- ✅ Database connection pooling
- ✅ CORS protection
- ✅ Input validation

---

## 📝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is private and not licensed for public use.

---

## 👥 Team

- **Developer:** Helm Rahmad
- **Organization:** LIDM 2025

---

## 📞 Support

Untuk bantuan dan dokumentasi lebih lanjut:

| Resource | Link |
|----------|------|
| 📡 API Docs | [API-DOCUMENTATION.md](./API-DOCUMENTATION.md) |
| 🗄️ Database Docs | [DATABASE-DOCUMENTATION.md](./DATABASE-DOCUMENTATION.md) |
| 🚀 Quick Reference | [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) |
| 🛠️ Deployment | [DEPLOYMENT.md](./DEPLOYMENT.md) |
| ⚡ Quick Start | [QUICKSTART.md](./QUICKSTART.md) |

---

**Made with ❤️ for LIDM 2025**
