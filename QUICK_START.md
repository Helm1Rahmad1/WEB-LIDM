# 🚀 Quick Start - Docker Setup

## ⚡ Cara Cepat Running Project:

### 1. Stop container yang lama
```bash
docker-compose down
```

### 2. Build dan start semua services
```bash
docker-compose up --build
```

### 3. Tunggu sampai ready (±30-60 detik)
Lihat log sampai muncul:
- ✅ `Server running on port 3001` (backend)
- ✅ `Ready on http://localhost:3000` (frontend)
- ✅ `database system is ready` (postgres)

### 4. Test di browser
- Buka: `http://localhost:3000/auth/login`
- Login dengan user yang verified
- Harus redirect ke dashboard

---

## 🔧 Yang Sudah Diperbaiki:

1. ✅ **Hapus konflik route** - `app/auth/logout/route.ts` sudah dihapus
2. ✅ **CORS Docker** - Backend accept request dari localhost:3000
3. ✅ **Token handling** - Pakai localStorage + Authorization header (bukan hanya cookie)
4. ✅ **Backend response** - Konsisten pakai `user_id` (snake_case)
5. ✅ **Redirect loop** - Middleware disabled, pakai client-side protection
6. ✅ **Docker network** - Containers bisa communicate

---

## 📋 Checklist Sebelum Test:

- [ ] `docker-compose down` sudah dijalankan
- [ ] Clear browser cache & cookies (atau pakai Incognito)
- [ ] `docker-compose up --build` running tanpa error
- [ ] Semua 3 containers status "Up" (cek: `docker-compose ps`)

---

## 🐛 Kalau Error:

**Build failed:**
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

**Port sudah dipakai:**
```bash
# Check siapa yang pakai port
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Kill process
taskkill /PID [PID] /F
```

**Lihat logs:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## ✅ Test Sukses Kalau:

1. Login berhasil (status 200)
2. Token tersimpan di localStorage
3. Redirect ke `/dashboard/guru` atau `/dashboard/murid`
4. Tidak ada error di console browser
5. Tidak ada redirect loop

**Sekarang jalankan: `docker-compose up --build`**
