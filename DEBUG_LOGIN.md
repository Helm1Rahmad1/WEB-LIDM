# 🔍 Debug Checklist - Login Issue

## Masalah: Email berubah setelah login & redirect ke login lagi

### Langkah Debug:

1. **Buka browser dalam Incognito/Private mode** (PENTING!)
   - Ini untuk menghindari cached data & autofill

2. **Buka DevTools (F12) > Console tab**

3. **Pergi ke: `http://localhost:3000/auth/login`**

4. **Masukkan email & password manually** (jangan pakai autofill!)
   - Email: `zril0612@gmail.com`
   - Password: [your password]

5. **Klik tombol "Masuk" dan perhatikan console logs**

### Expected Console Logs (Urutan yang Benar):

```
🔐 Attempting login with: zril0612@gmail.com
✅ Login successful, user data: { userId: "...", email: "zril0612@gmail.com", ... }
➡️ Navigating to dashboard
🔍 Checking auth status...
✅ User found in session: zril0612@gmail.com
✅ User authenticated: zril0612@gmail.com Role: [guru/murid]
➡️ Redirecting to guru/murid dashboard
```

### Yang Sudah Diperbaiki:

1. ✅ **Autocomplete OFF** - form tidak akan auto-fill dari browser
2. ✅ **Console logging** - bisa track apa yang terjadi
3. ✅ **Prevent double init** - AuthProvider tidak init 2x
4. ✅ **Loading state** - tidak setLoading(false) kalau login sukses

### Kalau Masih Error, Check:

#### 1. Network Tab (F12 > Network)
- Filter: `login`
- Klik request `/api/auth/login`
- **Response tab**: harus ada `user` object dan `token`
- **Preview tab**: check `user.email` = `zril0612@gmail.com`

#### 2. Application Tab (F12 > Application)
- **Cookies** > `http://localhost:3000`
  - Harus ada cookie `token`
- **Local Storage** > `http://localhost:3000`
  - Harus ada key `token` dan `role`
  - Value `token` harus sama dengan yang di cookie

#### 3. Console Tab Errors
- Cari error merah
- Screenshot dan kirim ke saya

### Quick Test Commands:

```bash
# Restart Docker fresh
docker-compose down
docker-compose up --build

# Check backend logs
docker-compose logs -f backend

# Check frontend logs  
docker-compose logs -f frontend
```

### Kemungkinan Penyebab:

1. **Browser autofill** - makanya pakai Incognito
2. **Cached service worker** - Clear site data di DevTools
3. **Token tidak tersimpan** - Check localStorage
4. **AuthProvider re-init** - sudah diperbaiki
5. **Backend response salah** - Check network tab

---

**Test sekarang dengan Incognito mode dan kirim screenshot console + network tab!**
