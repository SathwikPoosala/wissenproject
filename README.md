# Smart Seat Booking System - Backend

A comprehensive seat booking system for companies following a rotational hybrid work model.

## 🎯 Overview

This backend system manages seat bookings for a company with:
- **80 employees** divided into **10 squads** (8 members each)
- **50 total seats** available
- **2 batches** rotating weekly between office and remote work
- **Dynamic buffer seat** allocation system

## 📋 Features

### For Employees
- ✅ View weekly rotation schedule
- ✅ Book seats for scheduled days (up to 2 weeks in advance)
- ✅ Release bookings to free up seats
- ✅ Book buffer seats after 3 PM for next day (if not scheduled)
- ✅ View booking history and statistics
- ✅ Check seat availability

### For Admins
- ✅ Create and manage squads
- ✅ Assign employees to squads and batches
- ✅ View daily seat utilization
- ✅ Monitor buffer seat usage
- ✅ Access comprehensive analytics
- ✅ Manage user accounts

## 🔄 Rotation Logic

The system follows a 2-week rotation pattern:

| Week   | Mon-Wed  | Thu-Fri  |
|--------|----------|----------|
| Week 1 | BATCH_1  | BATCH_2  |
| Week 2 | BATCH_2  | BATCH_1  |

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: bcryptjs for password hashing

## 📁 Project Structure

```
smart-seat-booking-backend/
├── config/
│   ├── database.js          # MongoDB connection
│   └── constants.js         # System constants
├── controllers/
│   ├── admin/
│   │   ├── analytics.controller.js
│   │   ├── squad.controller.js
│   │   └── user.controller.js
│   ├── auth.controller.js
│   ├── booking.controller.js
│   └── schedule.controller.js
├── middleware/
│   └── auth.middleware.js   # Authentication & authorization
├── models/
│   ├── Booking.model.js
│   ├── Squad.model.js
│   └── User.model.js
├── routes/
│   ├── admin/
│   │   ├── analytics.routes.js
│   │   ├── squad.routes.js
│   │   └── user.routes.js
│   ├── auth.routes.js
│   ├── booking.routes.js
│   └── schedule.routes.js
├── utils/
│   ├── auth.utils.js
│   └── rotationEngine.js    # Core rotation logic
├── .env
├── .gitignore
├── package.json
├── seed.js                  # Database seeder
└── server.js               # Entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone or navigate to the project directory**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env` and update values:
   ```bash
   cp .env.example .env
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system

5. **Seed the database** (optional but recommended)
   ```bash
   node seed.js
   ```
   
   This creates:
   - 1 Admin user
   - 10 Squads (5 per batch)
   - 80 Employees (8 per squad)

6. **Start the server**
   ```bash
   npm run dev
   ```
   
   The server will run on `http://localhost:5000`

## 🔑 Default Credentials (After Seeding)

**Admin:**
- Email: `admin@company.com`
- Password: `admin123`

**Employees:**
- Email: `employee1@company.com` to `employee80@company.com`
- Password: `employee123`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password

### Bookings (Employee)
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/upcoming` - Get upcoming bookings
- `GET /api/bookings/stats` - Get booking statistics
- `GET /api/bookings/availability/:date` - Check availability
- `PUT /api/bookings/:id/release` - Release booking

### Schedule (Employee)
- `GET /api/schedule/weekly` - Get weekly schedule
- `GET /api/schedule/multi-week` - Get multi-week schedule
- `GET /api/schedule/check/:date` - Check schedule for date
- `GET /api/schedule/rotation-info` - Get rotation information

### Admin - Squad Management
- `POST /api/admin/squads` - Create squad
- `GET /api/admin/squads` - Get all squads
- `GET /api/admin/squads/:id` - Get single squad
- `PUT /api/admin/squads/:id` - Update squad
- `DELETE /api/admin/squads/:id` - Delete squad
- `POST /api/admin/squads/:id/members` - Add member to squad
- `DELETE /api/admin/squads/:id/members/:userId` - Remove member
- `GET /api/admin/squads/batch/:batch` - Get squads by batch

### Admin - User Management
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get single user
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/users/unassigned` - Get unassigned users

### Admin - Analytics
- `GET /api/admin/analytics/overview` - System overview
- `GET /api/admin/analytics/weekly` - Weekly analytics
- `GET /api/admin/analytics/daily/:date` - Daily utilization
- `GET /api/admin/analytics/bookings` - Booking history
- `GET /api/admin/analytics/squads` - Squad analytics

## 📊 Business Rules

### Scheduled Batch Members
- ✅ Can book seats for their allocated days
- ✅ Can book up to 2 weeks in advance
- ✅ Can release seats anytime before the booking date
- ✅ Each release increases buffer seats

### Non-Scheduled Batch Members
- ❌ Cannot book normally (not their scheduled days)
- ✅ Can book buffer seats with conditions:
  - Only after 3:00 PM
  - Only for the next day
  - Only if buffer seats are available

### Buffer Seats Calculation
```
Buffer Seats = Total Seats (50) - Active Bookings
```

## 🔐 Authentication

All routes except registration and login require authentication via JWT token.

**Authorization Header:**
```
Authorization: Bearer <your_jwt_token>
```

## 💾 Database Models

### User
- Personal information (name, email, password)
- Role (admin/employee)
- Squad assignment
- Active status

### Squad
- Squad name
- Batch assignment (BATCH_1 or BATCH_2)
- Members array
- Max members limit (8)

### Booking
- User reference
- Date
- Batch
- Buffer booking flag
- Status (active/released/cancelled)
- Timestamps

## 🧪 Testing the API

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"employee1@company.com","password":"employee123"}'
```

**Create Booking:**
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{"date":"2026-03-02"}'
```

### Using Postman

1. Import the API endpoints
2. Set up environment variables for base URL and token
3. Use the authentication endpoints to get a token
4. Test booking and admin endpoints

## 🎯 Key Features Implementation

### Rotation Engine
The `rotationEngine.js` utility handles all rotation logic:
- Calculates which batch is scheduled for any given date
- Validates booking eligibility
- Manages buffer booking time restrictions
- Generates weekly/multi-week schedules

### Booking Validation
Comprehensive validation ensures:
- Users belong to a squad
- Dates are valid weekdays
- Booking limits are respected
- Buffer booking rules are enforced
- Seat availability is checked

### Real-time Buffer Calculation
Buffer seats are calculated dynamically based on:
- Total seats (50)
- Active bookings for the date
- Released bookings increase buffer availability

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/smart-seat-booking |
| JWT_SECRET | JWT secret key | (set in .env) |
| JWT_EXPIRE | JWT expiration time | 7d |
| TOTAL_SEATS | Total available seats | 50 |
| BUFFER_BOOKING_TIME | Hour for buffer booking (24h) | 15 (3 PM) |
| MAX_ADVANCE_BOOKING_WEEKS | Max weeks to book ahead | 2 |

## 🚨 Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

## 📈 Future Enhancements

- [ ] Email notifications for bookings
- [ ] SMS reminders
- [ ] Waiting list functionality
- [ ] Seat preference system
- [ ] Team seating requests
- [ ] Calendar integration
- [ ] Mobile app support
- [ ] Reporting dashboard

## 🤝 Contributing

1. Follow the existing code structure
2. Add validation for all inputs
3. Include error handling
4. Update documentation for new features

## 📄 License

ISC

## 👨‍💻 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ for efficient hybrid work management**
