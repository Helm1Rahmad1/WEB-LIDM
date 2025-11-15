# Manual Deployment Guide (Tanpa GitHub Actions)

## 🎯 Setup Awal (Lakukan Sekali Saja)

### 1. Di Server SSH

```bash
# Login ke server
ssh root@srv1114408

# Pastikan di direktori project
cd ~/lombalidm2025

# Copy deploy script ke server
# (File deploy-server.sh sudah ada di repo)

# Buat script executable
chmod +x deploy-server.sh

# Buat shortcut deploy
cat > ~/deploy.sh << 'EOF'
#!/bin/bash
cd ~/lombalidm2025
git pull origin main
./deploy-server.sh
EOF

chmod +x ~/deploy.sh
```

### 2. Setup Git Hook (Auto Deploy saat Git Pull)

```bash
# Di server, masuk ke direktori git
cd ~/lombalidm2025/.git/hooks

# Buat post-merge hook
cat > post-merge << 'EOF'
#!/bin/bash
echo "🔄 Git pull detected, starting auto-deploy..."
cd ~/lombalidm2025
./deploy-server.sh
EOF

chmod +x post-merge

echo "✅ Git hook installed!"
```

## 🚀 Cara Deploy

### Metode 1: Manual Deploy dari Server

```bash
# SSH ke server
ssh root@srv1114408

# Jalankan deploy script
~/deploy.sh
```

### Metode 2: Auto Deploy (Git Hook)

```bash
# Di server
cd ~/lombalidm2025
git pull origin main
# Deploy otomatis jalan setelah pull!
```

### Metode 3: Deploy dari Local (via SSH)

```bash
# Di local terminal
ssh root@srv1114408 '~/deploy.sh'
```

## 📋 Deploy Workflow

1. **Edit kode di local**
2. **Commit & push**:
   ```bash
   git add .
   git commit -m "Fix: email verification"
   git push origin main
   ```
3. **Deploy di server**:
   ```bash
   ssh root@srv1114408 '~/deploy.sh'
   ```
4. **Selesai!** ✅

## 🔍 Troubleshooting

### Cek Status Deployment

```bash
# Cek container running
docker ps

# Cek logs backend
docker logs signquran_api_7fc9356 --tail 50

# Cek logs frontend
docker logs signquran_front_7fc9356 --tail 50

# Test backend
curl http://localhost:30011/api/auth/register -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123","role":"murid"}'
```

### Rollback ke Commit Sebelumnya

```bash
# Di server
cd ~/lombalidm2025
git log --oneline -10  # Lihat history
git reset --hard <commit-hash>
./deploy-server.sh
```

### Rebuild Manual

```bash
# Stop containers
docker stop signquran_api_7fc9356 signquran_front_7fc9356
docker rm signquran_api_7fc9356 signquran_front_7fc9356

# Rebuild
cd ~/lombalidm2025
./deploy-server.sh
```

## ⚙️ Environment Variables

Jika perlu update environment variables, edit di `deploy-server.sh`:

```bash
nano ~/lombalidm2025/deploy-server.sh
# Edit bagian -e DB_PASSWORD=... dll
# Save & exit (Ctrl+O, Enter, Ctrl+X)

# Re-deploy
~/deploy.sh
```

## 📝 Notes

- ✅ **No GitHub Actions needed** - Deploy tanpa billing
- ✅ **Git hook auto-deploy** - Pull langsung deploy
- ✅ **Container networking** - Semua di `lidm-network`
- ✅ **Database connection** - Via container name
- ✅ **Port mapping** - Frontend 30010, Backend 30011
- ✅ **Email service** - SMTP configured

## 🔐 Security Checklist

- [ ] Ganti `JWT_SECRET` dengan random string
- [ ] Simpan credentials di `.env` file (jangan hardcode)
- [ ] Gunakan Docker secrets untuk production
- [ ] Enable firewall untuk port yang tidak perlu
- [ ] Regular backup database

## 📊 Monitoring

```bash
# Watch logs real-time
docker logs -f signquran_api_7fc9356

# Check resource usage
docker stats

# Check disk space
df -h
docker system df
```

## 🧹 Maintenance

```bash
# Cleanup old images
docker image prune -f

# Cleanup unused containers
docker container prune -f

# Cleanup everything unused
docker system prune -af --volumes
```

---

**Last Updated**: November 15, 2025  
**Deployment Method**: Manual via SSH (No GitHub Actions)
