# Quick Fix: Error "sites-enabled" di Server

## Problem
```
Error: ENOENT: no such file or directory, stat '/app/sites-enabled'
```

## Penyebab
Ada file/folder `sites-enabled` atau file lain yang tidak seharusnya ada di root project dan ter-copy ke Docker build.

## Solusi

### Di Server VPS:

```bash
cd /root/lombalidm2025

# 1. Hapus file/folder yang tidak perlu
rm -rf sites-enabled sites-available 11.6.2 CACHED ERROR '[frontend'

# 2. Pull latest changes (sudah ada .dockerignore yang updated)
git pull origin zrill

# 3. Build ulang
docker compose down
docker compose build --no-cache

# 4. Start services
docker compose up -d
```

### Jika masih error, coba clean build:

```bash
# Stop dan hapus semua
docker compose down -v

# Hapus images
docker rmi lombalidm2025-frontend lombalidm2025-backend

# Build dari awal
docker compose build --no-cache

# Start
docker compose up -d
```

## Verifikasi Build Success

```bash
# Check build logs
docker compose logs frontend | grep "ready"

# Should see something like:
# ✓ Ready in XXms
```

## File yang Sudah Diupdate

1. ✅ `.dockerignore` - Exclude file yang tidak perlu
2. ✅ `next.config.mjs` - Ignore folder non-Next.js
3. ✅ `Dockerfile` - Gunakan npm install

## Catatan

File-file ini **TIDAK boleh ada** di root project:
- `sites-enabled/`
- `sites-available/`
- `11.6.2` (file random)
- `CACHED` (file random)
- `ERROR` (file random)
- `[frontend` (file random)

Hanya `nginx.conf` yang diperlukan (untuk setup di host, bukan di Docker).
