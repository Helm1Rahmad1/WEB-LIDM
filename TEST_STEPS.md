# 🔧 Panduan Testing Login & Dashboard (Docker Version)

## Masalah yang Diperbaiki:
1. ✅ Inconsistent data format antara backend `/login` dan `/me` endpoints
2. ✅ Token tidak disimpan di localStorage
3. ✅ API client tidak mengirim token di Authorization header
4. ✅ Redirect loop antara dashboard dan login
5. ✅ Middleware terlalu agresif dalam redirect
6. ✅ Docker CORS configuration untuk multi-container setup
7. ✅ Cookie sharing antara containers
8. ✅ Konflik route.ts dan page.tsx di logout

## 🐳 Langkah Testing dengan Docker:

### 1️⃣ Stop semua container yang running
```cmd
docker-compose down
```

### 2️⃣ Build dan Start semua containers
```cmd
docker-compose up --build
```
ATAU jalankan file `restart-dev.bat` yang sudah dibuat

Tunggu sampai semua service ready:
- ✅ Database (postgres): localhost:5433
- ✅ Backend: localhost:3001
- ✅ Frontend: localhost:3000

### 3️⃣ Cek status containers
```cmd
docker-compose ps
```
Semua container harus status "Up"

### 4️⃣ Cek logs jika ada error
```cmd
docker-compose logs -f
```
Untuk log specific service:
```cmd
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 5️⃣ Test Login Flow

1. **Clear browser cache dan cookies** (PENTING!)
   - Buka DevTools (F12)
   - Klik kanan tombol Refresh
   - Pilih "Empty Cache and Hard Reload"
   - ATAU gunakan Incognito/Private mode

2. Buka browser: `http://localhost:3000/auth/login`

3. Login dengan user yang sudah verified

4. **Periksa Console Browser (F12)**:
   - Harus ada log: `✅ Login successful, user data: {...}`
   - Harus ada log: `➡️ Navigating to dashboard`
   - Harus ada log: `✅ User authenticated: [email] Role: [role]`
   - Harus ada log: `➡️ Redirecting to guru/murid dashboard`

5. **Periksa Network Tab**:
   - Request `http://localhost:3001/api/auth/login` 
   - Status harus 200 OK
   - Response harus punya `user` dan `token`
   - Headers > Set-Cookie harus ada `token=...`

6. **Periksa Application Tab**:
   - Cookies: harus ada `token` dengan value JWT
   - Local Storage: harus ada `token` dan `role`

### 6️⃣ Test Dashboard Access

Setelah login berhasil:
- Harus redirect ke `/dashboard`
- Kemudian otomatis redirect ke `/dashboard/guru` atau `/dashboard/murid`

### 7️⃣ Test Protected Route

1. Logout atau clear cookies
2. Coba akses `http://localhost:3000/dashboard` langsung
3. Harus redirect ke `/auth/login`

## 🐛 Troubleshooting Docker:

### Build Error
```cmd
# Clear Docker cache dan rebuild
docker-compose down -v --rmi local
docker-compose build --no-cache
docker-compose up
```

### Port Already in Use
```cmd
# Check port yang digunakan
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :5433

# Kill process jika perlu
taskkill /PID [PID_NUMBER] /F
```

### Backend tidak bisa connect ke Database
- Pastikan database container sudah running
- Check connection dengan: `docker-compose logs postgres`
- Tunggu beberapa detik untuk database initialization

### CORS Error
- Backend sudah dikonfigurasi untuk accept multiple origins
- Check `docker-compose logs backend` untuk log CORS
- Pastikan FRONTEND_URL di docker-compose.yml benar

### Cookie tidak ter-set
- Di Docker, kita pakai localStorage + Authorization header
- Token harus ada di localStorage setelah login
- API client otomatis kirim token di Authorization header

## 📝 File yang Diubah untuk Docker:

1. **docker-compose.yml** - FRONTEND_URL support multiple origins
2. **backend/src/index.ts** - CORS config untuk multi-origin
3. **lib/api-client.ts** - Tambah Authorization header dengan token dari localStorage
4. **backend/src/routes/auth.ts** - Return token di response (bukan hanya cookie)
5. **app/auth/logout/route.ts** - DIHAPUS (konflik dengan page.tsx)
6. **middleware.ts** - Disabled untuk prevent redirect loop
7. **hooks/useAuth.tsx** - Added delay before redirect
8. **app/dashboard/page.tsx** - Added hasRedirected flag

## ✅ Expected Behavior:

1. Login → Store token di cookie + localStorage
2. API calls include Authorization: Bearer [token]
3. Navigate ke /dashboard 
4. Dashboard check user dari AuthContext
5. Redirect ke /dashboard/guru atau /dashboard/murid

## 🔍 Debug Commands:

```cmd
# Restart specific service
docker-compose restart backend
docker-compose restart frontend

# Enter container shell
docker exec -it lidm-backend sh
docker exec -it lidm-frontend sh

# Check backend health
curl http://localhost:3001/health

# View real-time logs
docker-compose logs -f --tail=100
```

---

**Jika masih error, kirim screenshot dari:**
- Browser Console (F12 > Console tab)
- Browser Network tab (request ke /api/auth/login)
- Browser Application tab (Cookies + localStorage)
- Terminal output dari `docker-compose logs backend`
