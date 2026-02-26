# Smart Seat Booking API Documentation

Base URL: `http://localhost:5000/api`

## Table of Contents
1. [Authentication](#authentication)
2. [Employee Endpoints](#employee-endpoints)
3. [Admin Endpoints](#admin-endpoints)
4. [Response Format](#response-format)

---

## Authentication

All authenticated requests must include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@company.com",
  "password": "password123",
  "role": "employee"  // optional, defaults to "employee"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@company.com",
    "role": "employee"
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@company.com",
  "password": "password123"
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

### Update User Details
```http
PUT /auth/updatedetails
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@company.com"
}
```

### Update Password
```http
PUT /auth/updatepassword
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

---

## Employee Endpoints

### 📅 Schedule Management

#### Get Weekly Schedule
```http
GET /schedule/weekly
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userBatch": "BATCH_1",
    "currentWeek": 1,
    "schedule": [
      {
        "date": "2026-03-02T00:00:00.000Z",
        "dayName": "Monday",
        "scheduledBatch": "BATCH_1",
        "isUserScheduled": true,
        "canBookNormally": true,
        "canBookBuffer": false
      }
    ]
  }
}
```

#### Get Multi-Week Schedule
```http
GET /schedule/multi-week?weeks=2
Authorization: Bearer <token>
```

#### Check Schedule for Specific Date
```http
GET /schedule/check/2026-03-02
Authorization: Bearer <token>
```

#### Get Rotation Information
```http
GET /schedule/rotation-info
Authorization: Bearer <token>
```

### 🎫 Booking Management

#### Create Booking
```http
POST /bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2026-03-02"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "_id": "booking_id",
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@company.com"
    },
    "date": "2026-03-02T00:00:00.000Z",
    "batch": "BATCH_1",
    "isBufferBooking": false,
    "status": "active",
    "bookedAt": "2026-02-26T10:00:00.000Z"
  }
}
```

**Error Response (Not Scheduled):**
```json
{
  "success": false,
  "message": "Buffer bookings can only be made after 3:00 PM"
}
```

#### Get My Bookings
```http
GET /bookings/my-bookings?status=active&startDate=2026-03-01&endDate=2026-03-31
Authorization: Bearer <token>
```

Query Parameters:
- `status` (optional): "active", "released", or "cancelled"
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

#### Get Upcoming Bookings
```http
GET /bookings/upcoming
Authorization: Bearer <token>
```

#### Check Seat Availability
```http
GET /bookings/availability/2026-03-02
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2026-03-02T00:00:00.000Z",
    "totalSeats": 50,
    "bookedSeats": 35,
    "bufferBookings": 5,
    "availableSeats": 15,
    "scheduledBatch": "BATCH_1",
    "userBatch": "BATCH_1",
    "isUserScheduled": true,
    "canBook": true,
    "canBookBuffer": false
  }
}
```

#### Release Booking
```http
PUT /bookings/:bookingId/release
Authorization: Bearer <token>
```

#### Get My Statistics
```http
GET /bookings/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "Last 30 days",
    "totalBookings": 12,
    "bufferBookings": 2,
    "regularBookings": 10,
    "releasedBookings": 1,
    "upcomingBookings": 5
  }
}
```

---

## Admin Endpoints

All admin endpoints require `admin` role.

### 👥 Squad Management

#### Create Squad
```http
POST /admin/squads
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Squad Alpha",
  "batch": "BATCH_1"
}
```

#### Get All Squads
```http
GET /admin/squads
Authorization: Bearer <admin_token>
```

#### Get Single Squad
```http
GET /admin/squads/:squadId
Authorization: Bearer <admin_token>
```

#### Update Squad
```http
PUT /admin/squads/:squadId
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Squad Alpha Updated",
  "batch": "BATCH_2",
  "isActive": true
}
```

#### Delete Squad
```http
DELETE /admin/squads/:squadId
Authorization: Bearer <admin_token>
```

#### Add Member to Squad
```http
POST /admin/squads/:squadId/members
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userId": "user_id_here"
}
```

#### Remove Member from Squad
```http
DELETE /admin/squads/:squadId/members/:userId
Authorization: Bearer <admin_token>
```

#### Get Squads by Batch
```http
GET /admin/squads/batch/BATCH_1
Authorization: Bearer <admin_token>
```

### 👤 User Management

#### Get All Users
```http
GET /admin/users
Authorization: Bearer <admin_token>
```

#### Get Single User
```http
GET /admin/users/:userId
Authorization: Bearer <admin_token>
```

#### Create User
```http
POST /admin/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "New Employee",
  "email": "newemployee@company.com",
  "password": "password123",
  "role": "employee",
  "squadId": "squad_id_here"  // optional
}
```

#### Update User
```http
PUT /admin/users/:userId
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "updated@company.com",
  "role": "employee",
  "isActive": true,
  "squadId": "new_squad_id"
}
```

#### Delete User
```http
DELETE /admin/users/:userId
Authorization: Bearer <admin_token>
```

#### Get Unassigned Users
```http
GET /admin/users/unassigned
Authorization: Bearer <admin_token>
```

### 📊 Analytics

#### System Overview
```http
GET /admin/analytics/overview
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "system": {
      "totalSeats": 50,
      "totalSquads": 10,
      "totalEmployees": 80,
      "assignedEmployees": 80,
      "unassignedEmployees": 0
    },
    "batches": {
      "batch1": {
        "squads": 5,
        "expectedMembers": 40
      },
      "batch2": {
        "squads": 5,
        "expectedMembers": 40
      }
    },
    "today": {
      "date": "2026-02-26T00:00:00.000Z",
      "scheduledBatch": "BATCH_1",
      "totalBookings": 35,
      "bufferBookings": 3,
      "availableSeats": 15,
      "utilization": "70.00"
    }
  }
}
```

#### Weekly Analytics
```http
GET /admin/analytics/weekly
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2026-02-26T00:00:00.000Z",
      "dayName": "Wednesday",
      "scheduledBatch": "BATCH_1",
      "totalBookings": 35,
      "bufferBookings": 3,
      "regularBookings": 32,
      "availableSeats": 15,
      "utilization": "70.00"
    }
  ]
}
```

#### Daily Utilization
```http
GET /admin/analytics/daily/2026-03-02
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2026-03-02T00:00:00.000Z",
    "scheduledBatch": "BATCH_1",
    "totalSeats": 50,
    "bookedSeats": 38,
    "bufferBookings": 2,
    "availableSeats": 12,
    "utilizationPercentage": "76.00",
    "bookings": [...]
  }
}
```

#### Booking History
```http
GET /admin/analytics/bookings?startDate=2026-03-01&endDate=2026-03-31&batch=BATCH_1&status=active
Authorization: Bearer <admin_token>
```

Query Parameters:
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string
- `userId` (optional): User ID
- `batch` (optional): "BATCH_1" or "BATCH_2"
- `status` (optional): "active", "released", or "cancelled"

#### Squad Analytics
```http
GET /admin/analytics/squads
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "squadId": "squad_id",
      "squadName": "Squad Alpha",
      "batch": "BATCH_1",
      "memberCount": 8,
      "maxMembers": 8,
      "bookingsLast7Days": 15,
      "averageBookingsPerMember": "1.88"
    }
  ]
}
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Optional success message",
  "data": {},
  "count": 0  // For list endpoints
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development mode only)"
}
```

### HTTP Status Codes

- `200 OK` - Successful GET/PUT request
- `201 Created` - Successful POST request
- `400 Bad Request` - Invalid input or business rule validation failed
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Booking Rules Reference

### Scheduled Batch Members
✅ Can book for their allocated days  
✅ Up to 2 weeks in advance  
✅ Can release anytime before booking date  

### Non-Scheduled Batch Members
❌ Cannot book normally  
✅ Can book buffer seats:
- After 3:00 PM only
- For next day only
- If buffer seats available

### Buffer Calculation
```
Buffer Seats = 50 (Total) - Active Bookings
```

---

## Testing Examples

### Example 1: Employee Books a Seat (Scheduled Day)
```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"employee1@company.com","password":"employee123"}'

# 2. Check schedule
curl -X GET http://localhost:5000/api/schedule/weekly \
  -H "Authorization: Bearer <token>"

# 3. Check availability
curl -X GET http://localhost:5000/api/bookings/availability/2026-03-03 \
  -H "Authorization: Bearer <token>"

# 4. Create booking
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"date":"2026-03-03"}'
```

### Example 2: Employee Books Buffer Seat (After 3 PM)
```bash
# Must be after 3 PM and booking for next day
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"date":"2026-02-27"}'  # Tomorrow's date
```

### Example 3: Admin Creates Squad and Assigns Members
```bash
# 1. Create squad
curl -X POST http://localhost:5000/api/admin/squads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{"name":"Squad Kilo","batch":"BATCH_1"}'

# 2. Create user
curl -X POST http://localhost:5000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{"name":"New Employee","email":"new@company.com","password":"pass123"}'

# 3. Add user to squad
curl -X POST http://localhost:5000/api/admin/squads/<squad_id>/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{"userId":"<user_id>"}'
```

---

## Postman Collection

Import this collection into Postman for easy testing. The collection includes:
- All endpoints documented above
- Pre-configured environment variables
- Example requests and responses
- Authentication setup

**Environment Variables:**
- `base_url`: http://localhost:5000/api
- `admin_token`: (Set after admin login)
- `user_token`: (Set after employee login)

---

## Rate Limiting & Best Practices

1. **Token Expiry**: JWT tokens expire after 7 days by default
2. **Pagination**: List endpoints return up to 100 items
3. **Date Format**: Use ISO 8601 format (YYYY-MM-DD)
4. **Time Zone**: All times are in UTC
5. **Validation**: Server validates all inputs and returns descriptive errors

---

For additional support or questions, please refer to the main README.md file.
