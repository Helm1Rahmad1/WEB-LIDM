# 🎯 Quick Guide: Update Swagger Documentation

## ✅ Yang Sudah Selesai:

- ✅ **auth.ts** - 6 endpoints (register, login, verify-email, resend-verification, logout, me)
- ✅ **rooms.ts** - 7 endpoints (get all, create, join, get students, get by id, update, delete)

## 🚀 Cara Deploy Update:

### 1. Commit Changes (Opsional)
```bash
git add .
git commit -m "Add Swagger documentation for auth and rooms routes"
git push
```

### 2. Deploy ke VPS
```bash
# SSH ke VPS
ssh root@signquran.site

# Masuk ke folder project
cd /root/lombalidm2025

# Pull update (jika sudah di-push)
git pull

# Rebuild backend
docker-compose build backend --no-cache

# Restart container
docker-compose up -d

# Check logs
docker-compose logs -f backend
```

### 3. Test Swagger UI
```
https://signquran.site/api-docs
```

Sekarang kamu akan melihat:
- **Authentication** section (6 endpoints)
- **Rooms** section (7 endpoints)

---

## 📝 Untuk Menambah Dokumentasi Route Lain:

Lihat file: `SWAGGER-ROUTES-DOCUMENTATION.md`

Copy-paste template untuk:
- progress.ts
- tests.ts
- hijaiyah.ts
- jilid.ts
- users.ts
- enrollments.ts
- practice.ts

Setelah menambah dokumentasi, ulangi step 1-3 di atas.

---

## 🎨 Tampilan di Swagger UI:

Setelah deploy, Swagger UI akan menampilkan:

```
Sign Quran API

Authentication
  POST   /api/auth/register
  GET    /api/auth/verify-email
  POST   /api/auth/login
  POST   /api/auth/resend-verification
  POST   /api/auth/logout
  GET    🔒 /api/auth/me

Rooms
  GET    🔒 /api/rooms
  POST   🔒 /api/rooms
  POST   🔒 /api/rooms/join
  GET    🔒 /api/rooms/{roomId}/students
  GET    🔒 /api/rooms/{id}
  PUT    🔒 /api/rooms/{id}
  DELETE 🔒 /api/rooms/{id}
```

🔒 = Butuh authentication (login dulu)

---

## 💡 Tips Menggunakan Swagger UI:

1. **Login dulu**:
   - Buka `POST /api/auth/login`
   - Click "Try it out"
   - Isi email & password
   - Click "Execute"
   - Copy token dari response

2. **Authorize**:
   - Click tombol "Authorize" (hijau, pojok kanan atas)
   - Paste token di field `bearerAuth`
   - Click "Authorize"
   - Click "Close"

3. **Test endpoint lain**:
   - Sekarang semua endpoint dengan 🔒 bisa di-test
   - Click endpoint → "Try it out" → Isi data → "Execute"

---

## 🐛 Troubleshooting:

### Swagger UI masih kosong
```bash
# Check logs
docker-compose logs -f backend

# Pastikan tidak ada error compiling TypeScript
# Pastikan swagger.ts sudah di-import di index.ts
```

### Endpoint tidak muncul
- Pastikan JSDoc comment tepat di atas router.get/post/put/delete
- Pastikan tag @swagger ada
- Restart backend setelah update

### Error 401 saat test endpoint
- Pastikan sudah login & authorize dengan token
- Check token belum expired (7 hari)

---

**Happy Testing! 🎉**
