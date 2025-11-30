# Messages API Documentation for Android

## Overview
API endpoints untuk sistem messaging antara guru dan murid. Semua endpoints memerlukan authentication via Bearer token.

## Base URL
```
https://your-api-domain.com/api/messages
```

## Authentication
Semua request harus menyertakan token JWT di header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Endpoints

### 1. Send Message
Mengirim pesan baru ke user lain.

**Endpoint:** `POST /api/messages`

**Request Body:**
```json
{
  "receiver_id": 123,
  "message": "Halo, bagaimana kabar Anda?"
}
```

**Response (201 Created):**
```json
{
  "message": "Message sent successfully",
  "data": {
    "message_id": 1,
    "sender_id": 456,
    "receiver_id": 123,
    "message": "Halo, bagaimana kabar Anda?",
    "created_at": "2025-12-01T06:30:00.000Z",
    "is_read": false
  }
}
```

**Error Responses:**
- `400 Bad Request` - receiver_id atau message tidak ada
- `404 Not Found` - Receiver tidak ditemukan
- `401 Unauthorized` - Token tidak valid

**Example cURL:**
```bash
curl -X POST https://your-api-domain.com/api/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"receiver_id": 123, "message": "Halo!"}'
```

---

### 2. Get Conversation
Mendapatkan semua pesan dalam percakapan dengan user tertentu.

**Endpoint:** `GET /api/messages?conversation_with={user_id}`

**Query Parameters:**
- `conversation_with` (required) - ID user lawan bicara

**Response (200 OK):**
```json
{
  "messages": [
    {
      "message_id": 1,
      "sender_id": 456,
      "receiver_id": 123,
      "message": "Halo!",
      "created_at": "2025-12-01T06:30:00.000Z",
      "is_read": true,
      "sender_name": "Guru Ahmad",
      "sender_email": "ahmad@example.com",
      "receiver_name": "Murid Budi",
      "receiver_email": "budi@example.com"
    },
    {
      "message_id": 2,
      "sender_id": 123,
      "receiver_id": 456,
      "message": "Halo juga!",
      "created_at": "2025-12-01T06:31:00.000Z",
      "is_read": false,
      "sender_name": "Murid Budi",
      "sender_email": "budi@example.com",
      "receiver_name": "Guru Ahmad",
      "receiver_email": "ahmad@example.com"
    }
  ],
  "count": 2
}
```

**Example cURL:**
```bash
curl -X GET "https://your-api-domain.com/api/messages?conversation_with=123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 3. Get All Conversations
Mendapatkan daftar semua percakapan user saat ini.

**Endpoint:** `GET /api/messages/conversations`

**Response (200 OK):**
```json
{
  "conversations": [
    {
      "user_id": 123,
      "name": "Murid Budi",
      "email": "budi@example.com",
      "role": "murid",
      "last_message": "Terima kasih!",
      "last_message_time": "2025-12-01T06:35:00.000Z",
      "unread_count": 2
    },
    {
      "user_id": 789,
      "name": "Murid Siti",
      "email": "siti@example.com",
      "role": "murid",
      "last_message": "Baik pak",
      "last_message_time": "2025-12-01T05:20:00.000Z",
      "unread_count": 0
    }
  ],
  "count": 2
}
```

**Example cURL:**
```bash
curl -X GET https://your-api-domain.com/api/messages/conversations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 4. Mark Message as Read
Menandai pesan tertentu sebagai sudah dibaca.

**Endpoint:** `PUT /api/messages/{message_id}/read`

**Path Parameters:**
- `message_id` - ID pesan yang akan ditandai sebagai dibaca

**Response (200 OK):**
```json
{
  "message": "Message marked as read",
  "data": {
    "message_id": 1,
    "sender_id": 456,
    "receiver_id": 123,
    "message": "Halo!",
    "created_at": "2025-12-01T06:30:00.000Z",
    "is_read": true
  }
}
```

**Error Responses:**
- `403 Forbidden` - Hanya receiver yang bisa mark as read
- `404 Not Found` - Message tidak ditemukan

**Example cURL:**
```bash
curl -X PUT https://your-api-domain.com/api/messages/1/read \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 5. Mark Conversation as Read
Menandai semua pesan dari user tertentu sebagai sudah dibaca.

**Endpoint:** `PUT /api/messages/mark-conversation-read`

**Request Body:**
```json
{
  "sender_id": 456
}
```

**Response (200 OK):**
```json
{
  "message": "Conversation marked as read",
  "updated_count": 5
}
```

**Example cURL:**
```bash
curl -X PUT https://your-api-domain.com/api/messages/mark-conversation-read \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sender_id": 456}'
```

---

### 6. Get Unread Count
Mendapatkan jumlah pesan yang belum dibaca.

**Endpoint:** `GET /api/messages/unread-count`

**Response (200 OK):**
```json
{
  "unread_count": 5
}
```

**Example cURL:**
```bash
curl -X GET https://your-api-domain.com/api/messages/unread-count \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Polling Strategy untuk Real-time Updates

Karena tidak menggunakan WebSocket, gunakan polling untuk mendapatkan pesan baru:

### Recommended Polling Intervals:
- **Saat di halaman chat:** Poll setiap 3-5 detik
- **Saat di background:** Poll setiap 30-60 detik
- **Untuk unread count (badge):** Poll setiap 15-30 detik

### Example Polling Implementation (Kotlin):
```kotlin
// Poll for new messages in active conversation
val handler = Handler(Looper.getMainLooper())
val pollRunnable = object : Runnable {
    override fun run() {
        fetchMessages(conversationUserId)
        handler.postDelayed(this, 5000) // Poll every 5 seconds
    }
}
handler.post(pollRunnable)

// Stop polling when leaving chat
override fun onDestroy() {
    super.onDestroy()
    handler.removeCallbacks(pollRunnable)
}
```

---

## Notification Implementation

### 1. Check for New Messages
Gunakan endpoint `/api/messages/unread-count` untuk mengetahui ada pesan baru.

### 2. Show Notification
Jika `unread_count > 0`, tampilkan notification dengan:
- Title: Nama pengirim
- Message: Preview pesan terakhir
- Action: Buka chat dengan pengirim

### 3. Mark as Read
Ketika user membuka chat, panggil `/api/messages/mark-conversation-read` untuk menandai semua pesan sebagai dibaca.

---

## Error Handling

Semua error response mengikuti format:
```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200 OK` - Request berhasil
- `201 Created` - Resource berhasil dibuat
- `400 Bad Request` - Request tidak valid
- `401 Unauthorized` - Token tidak valid atau tidak ada
- `403 Forbidden` - Tidak punya permission
- `404 Not Found` - Resource tidak ditemukan
- `500 Internal Server Error` - Server error

---

## Data Models

### Message Object
```kotlin
data class Message(
    val message_id: Int,
    val sender_id: Int,
    val receiver_id: Int,
    val message: String,
    val created_at: String, // ISO 8601 format
    val is_read: Boolean,
    val sender_name: String? = null,
    val sender_email: String? = null,
    val receiver_name: String? = null,
    val receiver_email: String? = null
)
```

### Conversation Object
```kotlin
data class Conversation(
    val user_id: Int,
    val name: String,
    val email: String,
    val role: String, // "guru" or "murid"
    val last_message: String,
    val last_message_time: String, // ISO 8601 format
    val unread_count: Int
)
```

---

## Testing

### Test Credentials
Gunakan credentials dari environment development Anda.

### Test Flow:
1. Login sebagai guru → dapatkan token
2. Send message ke murid
3. Login sebagai murid → dapatkan token
4. Get conversations → verify pesan muncul
5. Get messages → verify isi pesan
6. Mark as read
7. Verify unread count berkurang

---

## Notes

- Semua timestamp menggunakan format ISO 8601 (UTC)
- Message text maksimal length sesuai database (TEXT type, praktis unlimited)
- Pastikan handle network errors dengan graceful degradation
- Implement retry logic untuk failed requests
- Cache messages locally untuk offline access
