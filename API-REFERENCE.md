# API DOCUMENTATION - SignQuran Learning Management System

Base URL: `http://localhost:3001/api`

## Authentication

All endpoints (except auth endpoints) require authentication via JWT token in cookies or Authorization header.

## Endpoints Overview

### Authentication
- POST /auth/register - Register new user
- POST /auth/login - Login user
- POST /auth/logout - Logout user
- POST /auth/verify-email - Verify email
- POST /auth/resend-verification - Resend verification email

### Users
- GET /users - Get all users (guru only)
- GET /users/:id - Get user by id
- PUT /users/:id - Update user
- PUT /users/:id/password - Change password
- DELETE /users/:id - Delete user (guru only)

### Rooms
- GET /rooms - Get all rooms
- GET /rooms/:id - Get room by id
- POST /rooms - Create room (guru only)
- PUT /rooms/:id - Update room (guru only)
- DELETE /rooms/:id - Delete room (guru only)
- POST /rooms/join - Join room (murid only)
- GET /rooms/:roomId/students - Get students in room (guru only)

### Enrollments
- GET /enrollments - Get all enrollments
- GET /enrollments/:id - Get enrollment by id
- POST /enrollments - Create enrollment
- DELETE /enrollments/:id - Delete enrollment

### Hijaiyah (Arabic Letters)
- GET /hijaiyah - Get all hijaiyah letters
- GET /hijaiyah/:id - Get hijaiyah by id
- POST /hijaiyah - Create hijaiyah (guru only)
- PUT /hijaiyah/:id - Update hijaiyah (guru only)
- DELETE /hijaiyah/:id - Delete hijaiyah (guru only)

### Jilid (Learning Volumes)
- GET /jilid - Get all jilid
- GET /jilid/:id - Get jilid by id
- GET /jilid/:id/letters - Get letters in jilid
- POST /jilid - Create jilid (guru only)
- PUT /jilid/:id - Update jilid (guru only)
- DELETE /jilid/:id - Delete jilid (guru only)

### Jilid Letters (Letter-Volume Mapping)
- GET /jilid-letters - Get all jilid letters
- GET /jilid-letters/:id - Get jilid letter by id
- POST /jilid-letters - Create jilid letter (guru only)
- PUT /jilid-letters/:id - Update jilid letter (guru only)
- DELETE /jilid-letters/:id - Delete jilid letter (guru only)

### Tests
- GET /tests - Get all tests
- GET /tests/:id - Get test by id
- POST /tests - Create test
- PUT /tests/:id - Update test (guru only)
- DELETE /tests/:id - Delete test

### Progress
- GET /progress/letter - Get letter progress
- GET /progress/letter/:id - Get letter progress by id
- POST /progress/letter - Create/update letter progress
- PUT /progress/letter/:id - Update letter progress (guru only)
- DELETE /progress/letter/:id - Delete letter progress (guru only)
- GET /progress/jilid - Get jilid progress
- GET /progress/jilid/:id - Get jilid progress by id
- POST /progress/jilid - Create/update jilid progress
- PUT /progress/jilid/:id - Update jilid progress (guru only)
- DELETE /progress/jilid/:id - Delete jilid progress (guru only)

### Practice
- GET /practice - Get practice progress
- GET /practice/:id - Get practice by id
- POST /practice - Create/update practice
- PUT /practice/:id - Update practice
- DELETE /practice/:id - Delete practice (guru only)

## Detailed Endpoints

### Users API

#### GET /users
Get all users with pagination and filtering.

Query Parameters:
- role: string (optional) - Filter by role (guru/murid)
- search: string (optional) - Search by name or email
- limit: number (optional, default: 50) - Results per page
- offset: number (optional, default: 0) - Pagination offset

Response:
```json
{
  "users": [
    {
      "user_id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "murid",
      "created_at": "2025-01-01T00:00:00.000Z",
      "is_verified": true
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

#### GET /users/:id
Get user by ID.

Response:
```json
{
  "user": {
    "user_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "murid",
    "created_at": "2025-01-01T00:00:00.000Z",
    "is_verified": true
  }
}
```

#### PUT /users/:id
Update user information.

Request Body:
```json
{
  "name": "John Doe Updated",
  "email": "newemail@example.com",
  "role": "guru"
}
```

#### PUT /users/:id/password
Change user password.

Request Body:
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

#### DELETE /users/:id
Delete user (guru only).

Response:
```json
{
  "message": "User deleted successfully"
}
```

### Rooms API

#### GET /rooms
Get all rooms for current user.

Response:
```json
{
  "rooms": [
    {
      "room_id": 1,
      "name": "Kelas A",
      "description": "Kelas belajar hijaiyah",
      "code": "ABC123",
      "created_by": 1,
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET /rooms/:id
Get room by ID.

Response:
```json
{
  "room": {
    "room_id": 1,
    "name": "Kelas A",
    "description": "Kelas belajar hijaiyah",
    "code": "ABC123",
    "created_by": 1,
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

#### POST /rooms
Create new room (guru only).

Request Body:
```json
{
  "name": "Kelas A",
  "description": "Kelas belajar hijaiyah",
  "code": "ABC123"
}
```

#### PUT /rooms/:id
Update room (guru only, owner only).

Request Body:
```json
{
  "name": "Kelas A Updated",
  "description": "Updated description",
  "code": "XYZ789"
}
```

#### DELETE /rooms/:id
Delete room (guru only, owner only).

Response:
```json
{
  "message": "Room deleted successfully"
}
```

#### POST /rooms/join
Join room using code (murid only).

Request Body:
```json
{
  "code": "ABC123"
}
```

#### GET /rooms/:roomId/students
Get all students in room (guru only).

Response:
```json
{
  "students": [
    {
      "user_id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "joined_at": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### Hijaiyah API

#### GET /hijaiyah
Get all hijaiyah letters.

Response:
```json
{
  "letters": [
    {
      "hijaiyah_id": 1,
      "latin_name": "Alif",
      "arabic_char": "ا",
      "ordinal": 1
    }
  ]
}
```

#### POST /hijaiyah
Create hijaiyah letter (guru only).

Request Body:
```json
{
  "latinName": "Alif",
  "arabicChar": "ا",
  "ordinal": 1
}
```

#### PUT /hijaiyah/:id
Update hijaiyah letter (guru only).

Request Body:
```json
{
  "latinName": "Alif Updated",
  "arabicChar": "ا",
  "ordinal": 1
}
```

#### DELETE /hijaiyah/:id
Delete hijaiyah letter (guru only).

### Jilid API

#### GET /jilid
Get all jilid.

Response:
```json
{
  "jilid": [
    {
      "jilid_id": 1,
      "jilid_name": "Jilid 1",
      "description": "Jilid pertama"
    }
  ]
}
```

#### GET /jilid/:id/letters
Get all letters in a jilid.

Response:
```json
{
  "letters": [
    {
      "hijaiyah_id": 1,
      "latin_name": "Alif",
      "arabic_char": "ا",
      "ordinal": 1,
      "sort_order": 1
    }
  ]
}
```

#### POST /jilid
Create jilid (guru only).

Request Body:
```json
{
  "jilidName": "Jilid 1",
  "description": "Jilid pertama"
}
```

### Tests API

#### GET /tests
Get all tests with filtering.

Query Parameters:
- roomId: number (optional)
- hijaiyahId: number (optional)
- status: string (optional)

Response:
```json
{
  "tests": [
    {
      "test_id": 1,
      "user_id": 1,
      "room_id": 1,
      "hijaiyah_id": 1,
      "jilid_id": 1,
      "score": 85,
      "status": "lulus",
      "tested_at": "2025-01-01T00:00:00.000Z",
      "latin_name": "Alif",
      "arabic_char": "ا",
      "jilid_name": "Jilid 1",
      "user_name": "John Doe"
    }
  ]
}
```

#### POST /tests
Create test result.

Request Body:
```json
{
  "roomId": 1,
  "hijaiyahId": 1,
  "jilidId": 1,
  "score": 85,
  "status": "lulus"
}
```

#### PUT /tests/:id
Update test (guru only).

Request Body:
```json
{
  "score": 90,
  "status": "lulus",
  "jilidId": 1
}
```

### Progress API

#### GET /progress/letter
Get letter progress.

Query Parameters:
- roomId: number (optional)
- targetUserId: number (optional, guru only)
- status: string (optional)

Response:
```json
{
  "progress": [
    {
      "progress_id": 1,
      "user_id": 1,
      "room_id": 1,
      "hijaiyah_id": 1,
      "status": "belajar",
      "last_update": "2025-01-01T00:00:00.000Z",
      "latin_name": "Alif",
      "arabic_char": "ا",
      "user_name": "John Doe"
    }
  ]
}
```

#### POST /progress/letter
Create or update letter progress.

Request Body:
```json
{
  "roomId": 1,
  "hijaiyahId": 1,
  "status": "belajar"
}
```

#### GET /progress/jilid
Get jilid progress.

Query Parameters:
- roomId: number (optional)
- targetUserId: number (optional, guru only)
- status: string (optional)

#### POST /progress/jilid
Create or update jilid progress.

Request Body:
```json
{
  "roomId": 1,
  "jilidId": 1,
  "status": "belajar"
}
```

### Practice API

#### GET /practice
Get practice progress.

Query Parameters:
- targetUserId: number (optional, guru only)
- hijaiyahId: number (optional)
- status: string (optional)

Response:
```json
{
  "practices": [
    {
      "practice_id": 1,
      "user_id": 1,
      "hijaiyah_id": 1,
      "status": "belajar",
      "attempts": 5,
      "last_update": "2025-01-01T00:00:00.000Z",
      "latin_name": "Alif",
      "arabic_char": "ا",
      "user_name": "John Doe"
    }
  ]
}
```

#### POST /practice
Create or update practice progress.

Request Body:
```json
{
  "hijaiyahId": 1,
  "status": "belajar",
  "attempts": 1
}
```

#### PUT /practice/:id
Update practice progress.

Request Body:
```json
{
  "status": "lulus",
  "attempts": 10
}
```

## Status Values

### Progress Status
- belajar: Currently learning
- lulus: Passed

### Test Status
- belum_lulus: Not passed
- lulus: Passed

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error
