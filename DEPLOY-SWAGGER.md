# Deploy Swagger UI dengan Docker

## 📚 Yang Sudah Dibuat

1. ✅ `backend/package.json` - Ditambahkan dependencies Swagger
2. ✅ `backend/src/config/swagger.ts` - Konfigurasi OpenAPI 3.0
3. ✅ `backend/src/index.ts` - Integrasi Swagger UI middleware

## 🚀 Langkah Deploy di VPS (Docker)

### 1. Pull Perubahan Code ke VPS

```bash
# Di VPS, masuk ke folder project
cd /path/to/your/project

# Pull perubahan terbaru dari git
git pull origin main
```

### 2. Rebuild Backend Container

Backend container perlu di-rebuild karena ada dependency baru (swagger-jsdoc, swagger-ui-express):

```bash
# Stop semua container
docker-compose down

# Rebuild backend container (tanpa cache)
docker-compose build backend --no-cache

# Start semua container lagi
docker-compose up -d
```

### 3. Verifikasi Container Running

```bash
# Cek status container
docker-compose ps

# Cek logs backend
docker-compose logs -f backend
```

### 4. Test Swagger UI

Buka browser dan akses:
- **Production**: https://signquran.site/api-docs
- **Development**: http://localhost:3001/api-docs

## 📝 Endpoint Swagger UI

| Environment | Swagger URL |
|------------|-------------|
| Production | `https://signquran.site/api-docs` |
| Development | `http://localhost:3001/api-docs` |

## 🔧 Troubleshooting

### Error: Cannot find module 'swagger-ui-express'

**Penyebab**: Dependencies belum terinstall di container

**Solusi**:
```bash
# Rebuild container untuk install dependencies
docker-compose build backend --no-cache
docker-compose up -d
```

### Error: 404 Not Found di /api-docs

**Kemungkinan**:
1. Backend belum restart setelah code update
2. Nginx perlu konfigurasi tambahan

**Solusi**:
```bash
# Restart backend
docker-compose restart backend

# Jika masih error, cek Nginx config
# Pastikan /api-docs route di-forward ke backend
```

### Nginx Configuration (Jika Diperlukan)

Jika Nginx block akses ke `/api-docs`, tambahkan di config:

```nginx
# /etc/nginx/sites-available/signquran.site

location /api-docs {
    proxy_pass http://localhost:3001/api-docs;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

location /api/ {
    proxy_pass http://localhost:3001/api/;
    # ... rest of config
}
```

Reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 📖 Fitur Swagger UI

### Try It Out
- Klik endpoint yang ingin di-test
- Klik tombol **"Try it out"**
- Isi parameter (jika ada)
- Klik **"Execute"**
- Lihat response di bawah

### Authentication
Untuk endpoint yang butuh auth (Bearer token):
1. Klik tombol **"Authorize"** (ikon gembok) di kanan atas
2. Paste JWT token dengan format: `Bearer your-token-here`
3. Klik **"Authorize"**
4. Sekarang semua request akan include token

### Download OpenAPI Spec
Swagger spec JSON tersedia di: `https://signquran.site/api-docs/swagger.json`

## 🎨 Customization

Swagger UI sudah dikustomisasi dengan:
- ✅ Custom title: "SignQuran API Documentation"
- ✅ Hidden topbar (hapus branding Swagger)
- ✅ Dark/light theme toggle
- ✅ Automatic environment detection (dev/prod URLs)

## 📊 Coverage

Dokumentasi yang tersedia di Swagger:

### Authentication Endpoints
- POST `/api/auth/register` - Register user baru
- POST `/api/auth/login` - Login user
- POST `/api/auth/logout` - Logout user
- POST `/api/auth/verify-email` - Verifikasi email
- POST `/api/auth/resend-verification` - Kirim ulang email verifikasi

### Rooms Endpoints
- GET `/api/rooms` - List semua rooms
- POST `/api/rooms/join` - Join room
- DELETE `/api/rooms/leave/:roomId` - Leave room

### Progress Endpoints
- GET `/api/progress/:userId` - Get user progress
- POST `/api/progress` - Update progress
- GET `/api/progress/room/:roomId` - Get room progress

### Tests Endpoints
- POST `/api/tests/submit` - Submit test
- GET `/api/tests/results/:userId` - Get test results

### Hijaiyah Endpoints
- GET `/api/hijaiyah` - List huruf hijaiyah
- GET `/api/hijaiyah/:id` - Get detail huruf

### Jilid Endpoints
- GET `/api/jilid` - List semua jilid
- GET `/api/jilid/:id` - Get detail jilid

## 🔄 Update Documentation

Untuk menambah/update dokumentasi endpoint:

1. Tambahkan JSDoc comment di route file (contoh: `backend/src/routes/auth.ts`):

```typescript
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [guru, murid]
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', async (req, res) => {
  // ... implementation
});
```

2. Swagger akan auto-detect dan update dokumentasi
3. Refresh page `/api-docs` untuk melihat perubahan

## ✅ Checklist Deploy

- [ ] Code sudah di-push ke git repository
- [ ] Pull code di VPS (`git pull`)
- [ ] Stop container (`docker-compose down`)
- [ ] Rebuild backend (`docker-compose build backend --no-cache`)
- [ ] Start container (`docker-compose up -d`)
- [ ] Cek logs (`docker-compose logs -f backend`)
- [ ] Test Swagger UI (`https://signquran.site/api-docs`)
- [ ] Test endpoints dengan "Try it out"
- [ ] Update Nginx config (jika perlu)

## 🎯 Next Steps

Setelah Swagger UI running:

1. **Annotate Routes**: Tambahkan JSDoc `@swagger` di semua route handlers
2. **Add Examples**: Tambahkan contoh request/response di schema
3. **Group by Tags**: Organize endpoints by feature tags
4. **Add Authentication**: Document bearer token requirement
5. **Response Schemas**: Define all response models di swagger.ts

---

**Note**: Error lint "Cannot find module" adalah normal sebelum rebuild container. Setelah `docker-compose build`, error akan hilang karena package sudah terinstall di dalam container.
