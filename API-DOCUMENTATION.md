# 📚 API Documentation - Sign Quran

**Base URL:** `https://signquran.site/api`

## 🔐 Authentication

Menggunakan JWT Token yang disimpan di cookies dan header Authorization.

### Register
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "murid" // atau "guru"
}
```

**Response Success (201):**
```json
{
  "message": "Registration successful! Please check your email to verify your account.",
  "userId": "uuid-here",
  "user": {
    "user_id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "murid"
  }
}
```

**Response Error (400):**
```json
{
  "error": "Email already exists"
}
```

---

### Verify Email
```http
GET /api/auth/verify-email?token={verification_token}
```

**Query Parameters:**
- `token` (required): Token verifikasi dari email

**Response Success (200):**
```json
{
  "message": "Email verified successfully! Welcome to our platform.",
  "verified": true,
  "welcome_email_sent": true
}
```

**Response Error (400):**
```json
{
  "error": "Invalid or expired verification token"
}
```

---

### Resend Verification Email
```http
POST /api/auth/resend-verification
```

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response Success (200):**
```json
{
  "message": "Verification email sent successfully"
}
```

---

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response Success (200):**
```json
{
  "message": "Login successful",
  "user": {
    "user_id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "murid"
  },
  "token": "jwt-token-here"
}
```

**Response Error (403):**
```json
{
  "error": "Please verify your email before logging in. Check your email for the verification link.",
  "email_verified": false
}
```

---

### Get Current User
```http
GET /api/auth/me
```

**Headers:**
```
Authorization: Bearer {jwt-token}
Cookie: token={jwt-token}
```

**Response Success (200):**
```json
{
  "user": {
    "user_id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "murid",
    "is_verified": true
  }
}
```

---

### Logout
```http
POST /api/auth/logout
```

**Response Success (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

## 🏫 Rooms (Kelas)

### Get All Rooms (User's Rooms)
```http
GET /api/rooms
```

**Headers:** Requires authentication

**Response Success (200):**
```json
[
  {
    "room_id": 1,
    "name": "Kelas Iqra 1",
    "description": "Belajar dasar-dasar hijaiyah",
    "code": "ABC123",
    "created_by": "uuid-guru",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### Create Room (Guru only)
```http
POST /api/rooms
```

**Headers:** 
- Requires authentication
- Role: `guru`

**Request Body:**
```json
{
  "name": "Kelas Iqra 1",
  "description": "Belajar dasar-dasar hijaiyah"
}
```

**Response Success (201):**
```json
{
  "room_id": 1,
  "name": "Kelas Iqra 1",
  "description": "Belajar dasar-dasar hijaiyah",
  "code": "ABC123",
  "created_by": "uuid-guru"
}
```

---

### Join Room (Murid only)
```http
POST /api/rooms/join
```

**Headers:**
- Requires authentication
- Role: `murid`

**Request Body:**
```json
{
  "code": "ABC123"
}
```

**Response Success (200):**
```json
{
  "message": "Successfully joined the room",
  "enrollment_id": 1
}
```

---

### Get Room Students (Guru only)
```http
GET /api/rooms/:roomId/students
```

**Headers:**
- Requires authentication
- Role: `guru`

**Response Success (200):**
```json
[
  {
    "user_id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "joined_at": "2024-01-01T00:00:00Z"
  }
]
```

---

## 📊 Progress

### Get Letter Progress
```http
GET /api/progress/letter?roomId={room_id}
```

**Headers:** Requires authentication

**Query Parameters:**
- `roomId` (required): ID room/kelas

**Response Success (200):**
```json
[
  {
    "hijaiyah_id": 1,
    "latin_name": "Alif",
    "arabic_char": "ا",
    "status": "belajar",
    "last_update": "2024-01-01T00:00:00Z"
  }
]
```

---

### Get Jilid Progress
```http
GET /api/progress/jilid?roomId={room_id}
```

**Headers:** Requires authentication

**Response Success (200):**
```json
[
  {
    "jilid_id": 1,
    "jilid_name": "Jilid 1",
    "status": "belajar",
    "last_update": "2024-01-01T00:00:00Z"
  }
]
```

---

### Update Letter Progress
```http
POST /api/progress/letter
```

**Headers:** Requires authentication

**Request Body:**
```json
{
  "roomId": 1,
  "hijaiyahId": 1,
  "status": "lulus" // atau "belajar"
}
```

**Response Success (200):**
```json
{
  "message": "Progress updated successfully"
}
```

---

## ✅ Tests (Ujian)

### Get Tests
```http
GET /api/tests?roomId={room_id}
```

**Headers:** Requires authentication

**Response Success (200):**
```json
[
  {
    "test_id": 1,
    "user_id": "uuid-here",
    "room_id": 1,
    "hijaiyah_id": 1,
    "jilid_id": 1,
    "score": 85,
    "status": "lulus",
    "tested_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### Create Test Result
```http
POST /api/tests
```

**Headers:** Requires authentication

**Request Body:**
```json
{
  "roomId": 1,
  "hijaiyahId": 1,
  "jilidId": 1,
  "score": 85,
  "status": "lulus" // atau "belum_lulus"
}
```

**Response Success (201):**
```json
{
  "test_id": 1,
  "message": "Test result saved successfully"
}
```

---

## 📖 Hijaiyah

### Get All Hijaiyah Letters
```http
GET /api/hijaiyah
```

**Response Success (200):**
```json
[
  {
    "hijaiyah_id": 1,
    "latin_name": "Alif",
    "arabic_char": "ا",
    "ordinal": 1
  },
  {
    "hijaiyah_id": 2,
    "latin_name": "Ba",
    "arabic_char": "ب",
    "ordinal": 2
  }
]
```

---

### Get Single Hijaiyah Letter
```http
GET /api/hijaiyah/:id
```

**Response Success (200):**
```json
{
  "hijaiyah_id": 1,
  "latin_name": "Alif",
  "arabic_char": "ا",
  "ordinal": 1
}
```

---

## 📚 Jilid

### Get All Jilid
```http
GET /api/jilid
```

**Response Success (200):**
```json
[
  {
    "jilid_id": 1,
    "jilid_name": "Jilid 1",
    "description": "Pengenalan huruf dasar"
  }
]
```

---

### Get Single Jilid
```http
GET /api/jilid/:id
```

**Response Success (200):**
```json
{
  "jilid_id": 1,
  "jilid_name": "Jilid 1",
  "description": "Pengenalan huruf dasar"
}
```

---

### Get Jilid Letters
```http
GET /api/jilid/:id/letters
```

**Response Success (200):**
```json
[
  {
    "hijaiyah_id": 1,
    "latin_name": "Alif",
    "arabic_char": "ا",
    "sort_order": 1
  }
]
```

---

## 📝 Error Responses

Semua error response mengikuti format:

```json
{
  "error": "Error message here"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (tidak login)
- `403` - Forbidden (tidak ada akses/email belum verified)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔑 Authentication Flow

1. **Register** → Dapat email verification
2. **Verify Email** → Klik link di email
3. **Login** → Dapat JWT token
4. **Access Protected Routes** → Gunakan token di header/cookie

---

## 👥 User Roles

- **guru**: Dapat membuat kelas, melihat progress murid
- **murid**: Dapat join kelas, belajar, ujian
