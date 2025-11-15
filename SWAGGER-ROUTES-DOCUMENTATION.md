# 📝 Swagger Documentation untuk Routes Lainnya

File ini berisi template dokumentasi Swagger untuk routes yang belum didokumentasikan.

---

## Progress Routes (`progress.ts`)

tes misal

Tambahkan di atas setiap endpoint:

```typescript
/**
 * @swagger
 * /api/progress:
 *   get:
 *     summary: Get progress belajar user (per jilid/huruf)
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Progress data retrieved
 */

/**
 * @swagger
 * /api/progress:
 *   post:
 *     summary: Update/save progress belajar
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jilid_id:
 *                 type: string
 *               letter_id:
 *                 type: string
 *               score:
 *                 type: number
 *               completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Progress saved successfully
 */
```

---

## Tests Routes (`tests.ts`)

```typescript
/**
 * @swagger
 * /api/tests:
 *   get:
 *     summary: Get list semua test/ujian
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of tests
 */

/**
 * @swagger
 * /api/tests:
 *   post:
 *     summary: Buat test baru (hanya guru)
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - room_id
 *               - title
 *               - jilid_id
 *             properties:
 *               room_id:
 *                 type: string
 *               title:
 *                 type: string
 *                 example: Ujian Jilid 1
 *               description:
 *                 type: string
 *               jilid_id:
 *                 type: string
 *               duration_minutes:
 *                 type: number
 *                 example: 30
 *               passing_score:
 *                 type: number
 *                 example: 70
 *     responses:
 *       201:
 *         description: Test created successfully
 */

/**
 * @swagger
 * /api/tests/{id}:
 *   get:
 *     summary: Get test detail by ID
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Test detail
 */

/**
 * @swagger
 * /api/tests/{id}/submit:
 *   post:
 *     summary: Submit test result (murid mengerjakan test)
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *               score:
 *                 type: number
 *     responses:
 *       200:
 *         description: Test submitted successfully
 */

/**
 * @swagger
 * /api/tests/{id}/results:
 *   get:
 *     summary: Get hasil test dari semua murid (guru)
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Test results from all students
 */
```

---

## Hijaiyah Routes (`hijaiyah.ts`)

```typescript
/**
 * @swagger
 * /api/hijaiyah:
 *   get:
 *     summary: Get semua huruf hijaiyah
 *     tags: [Hijaiyah]
 *     responses:
 *       200:
 *         description: List of hijaiyah letters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 letters:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       letter_id:
 *                         type: string
 *                       arabic:
 *                         type: string
 *                       latin:
 *                         type: string
 *                       sign_url:
 *                         type: string
 */

/**
 * @swagger
 * /api/hijaiyah/{id}:
 *   get:
 *     summary: Get detail huruf hijaiyah by ID
 *     tags: [Hijaiyah]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hijaiyah letter detail
 */
```

---

## Jilid Routes (`jilid.ts`)

```typescript
/**
 * @swagger
 * /api/jilid:
 *   get:
 *     summary: Get semua jilid (level pembelajaran)
 *     tags: [Jilid]
 *     responses:
 *       200:
 *         description: List of jilid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jilid:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       jilid_id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       level:
 *                         type: number
 *                       description:
 *                         type: string
 */

/**
 * @swagger
 * /api/jilid/{id}:
 *   get:
 *     summary: Get detail jilid by ID
 *     tags: [Jilid]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Jilid detail
 */

/**
 * @swagger
 * /api/jilid/{id}/letters:
 *   get:
 *     summary: Get huruf-huruf dalam jilid tertentu
 *     tags: [Jilid]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Letters in jilid
 */
```

---

## Users Routes (`users.ts`)

```typescript
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User detail
 */

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 */
```

---

## Enrollments Routes (`enrollments.ts`)

```typescript
/**
 * @swagger
 * /api/enrollments:
 *   get:
 *     summary: Get enrollments (pendaftaran kelas)
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of enrollments
 */

/**
 * @swagger
 * /api/enrollments/{id}:
 *   delete:
 *     summary: Keluar dari kelas/room
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Left room successfully
 */
```

---

## Practice Routes (`practice.ts`)

```typescript
/**
 * @swagger
 * /api/practice:
 *   get:
 *     summary: Get practice sessions
 *     tags: [Practice]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of practice sessions
 */

/**
 * @swagger
 * /api/practice:
 *   post:
 *     summary: Submit practice result
 *     tags: [Practice]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               letter_id:
 *                 type: string
 *               score:
 *                 type: number
 *               video_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Practice submitted successfully
 */
```

---

## 🚀 Cara Apply Dokumentasi:

1. **Buka file route** (misal: `progress.ts`, `tests.ts`, dll)
2. **Copy dokumentasi dari atas** yang sesuai
3. **Paste tepat di atas endpoint** (sebelum `router.get(...)` atau `router.post(...)`)
4. **Save file**
5. **Restart backend**:
   ```bash
   docker-compose restart backend
   ```
6. **Refresh Swagger UI**: https://signquran.site/api-docs

---

## 💡 Tips:

- **Tags** digunakan untuk grouping endpoint (Authentication, Rooms, Tests, dll)
- **Security** menandakan endpoint butuh login (🔒 di Swagger UI)
- **Parameters** untuk path/query params (`/api/rooms/:id` → `{id}`)
- **RequestBody** untuk data yang dikirim (POST, PUT, PATCH)
- **Responses** untuk status code & format response

---

## ✅ Yang Sudah Didokumentasikan:

- ✅ **auth.ts** - Authentication endpoints
- ✅ **rooms.ts** - Room management endpoints

## 📋 Yang Perlu Didokumentasikan:

- ⬜ **progress.ts**
- ⬜ **tests.ts**
- ⬜ **hijaiyah.ts**
- ⬜ **jilid.ts**
- ⬜ **jilid-letters.ts**
- ⬜ **users.ts**
- ⬜ **enrollments.ts**
- ⬜ **practice.ts**

Copy-paste template di atas ke masing-masing file, sesuaikan kalau ada perbedaan endpoint!
