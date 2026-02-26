# 🚀 Quick Start Guide

Get your Smart Seat Booking Backend up and running in minutes!

## Prerequisites Checklist

- [ ] Node.js installed (v14+)
- [ ] MongoDB installed and running
- [ ] Terminal/Command Prompt access

## Step-by-Step Setup

### 1. Verify MongoDB is Running

**Windows:** Check if MongoDB service is running
```bash
# In Command Prompt or PowerShell
sc query MongoDB
```

If not running, start it:
```bash
net start MongoDB
```

**Mac/Linux:**
```bash
sudo systemctl status mongod
# or
brew services list
```

### 2. Dependencies Already Installed ✅

The project dependencies have been installed. If you need to reinstall:
```bash
npm install
```

### 3. Environment Configuration ✅

The `.env` file is already configured with default values. You can modify if needed:
- Database URL
- JWT Secret
- Port number

### 4. Seed the Database

Populate the database with sample data (RECOMMENDED):

```bash
node seed.js
```

This creates:
- 1 Admin account
- 10 Squads (5 per batch)
- 80 Employees (8 per squad)

**Default Credentials Created:**
- **Admin**: `admin@company.com` / `admin123`
- **Employees**: `employee1@company.com` to `employee80@company.com` / `employee123`

### 5. Start the Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

You should see:
```
✅ MongoDB Connected: localhost
🚀 Server is running on port 5000
📊 Environment: development
🔗 API Health Check: http://localhost:5000/api/health
```

### 6. Verify Installation

Open your browser or use curl:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Smart Seat Booking API is running",
  "timestamp": "2026-02-26T..."
}
```

## 🎯 Test Your First API Call

### Login as Admin

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@company.com\",\"password\":\"admin123\"}"
```

You'll get a response with a JWT token:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {...}
}
```

### View System Overview (Admin)

Replace `<YOUR_TOKEN>` with the token from above:

```bash
curl -X GET http://localhost:5000/api/admin/analytics/overview \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

### Login as Employee

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"employee1@company.com\",\"password\":\"employee123\"}"
```

### Check Your Schedule

```bash
curl -X GET http://localhost:5000/api/schedule/weekly \
  -H "Authorization: Bearer <EMPLOYEE_TOKEN>"
```

### Create a Booking

```bash
# Replace date with a valid future weekday
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <EMPLOYEE_TOKEN>" \
  -d "{\"date\":\"2026-03-02\"}"
```

## 📱 Using Postman or Thunder Client

### Setup in Postman:

1. **Create Environment:**
   - Variable: `base_url`
   - Value: `http://localhost:5000/api`

2. **Login Request:**
   - Method: POST
   - URL: `{{base_url}}/auth/login`
   - Body (JSON):
     ```json
     {
       "email": "admin@company.com",
       "password": "admin123"
     }
     ```

3. **Save Token:**
   - From response, copy the `token` value
   - Create environment variable `token`
   - Paste the token value

4. **Protected Requests:**
   - Header: `Authorization`
   - Value: `Bearer {{token}}`

## 🔍 Exploring the System

### Key Concepts to Understand:

**1. Rotation Pattern:**
- Week 1: BATCH_1 works Mon-Wed, BATCH_2 works Thu-Fri
- Week 2: BATCH_2 works Mon-Wed, BATCH_1 works Thu-Fri

**2. Booking Types:**
- **Regular Booking**: Scheduled batch members can book their assigned days
- **Buffer Booking**: Non-scheduled members can book after 3 PM for next day

**3. Seat Allocation:**
- Total: 50 seats
- Dynamically allocated based on bookings
- Buffer = Available seats when less than 40 people book

### Try These Scenarios:

**Scenario 1: Admin manages squads**
```bash
# Get all squads
GET /api/admin/squads

# Create new squad
POST /api/admin/squads
{
  "name": "Squad Kilo",
  "batch": "BATCH_1"
}

# Add member to squad
POST /api/admin/squads/:squadId/members
{
  "userId": "user_id_here"
}
```

**Scenario 2: Employee books a seat**
```bash
# Check your schedule
GET /api/schedule/weekly

# Check seat availability
GET /api/bookings/availability/2026-03-02

# Book a seat
POST /api/bookings
{
  "date": "2026-03-02"
}

# View your bookings
GET /api/bookings/my-bookings
```

**Scenario 3: Employee releases a booking**
```bash
# Release booking
PUT /api/bookings/:bookingId/release
```

**Scenario 4: Admin views analytics**
```bash
# System overview
GET /api/admin/analytics/overview

# Weekly analytics
GET /api/admin/analytics/weekly

# Daily utilization
GET /api/admin/analytics/daily/2026-03-02
```

## 📊 Understanding the Data

After seeding, you have:

**10 Squads:**
- Squad Alpha to Echo → BATCH_1
- Squad Foxtrot to Juliet → BATCH_2

**80 Employees:**
- employee1-40@company.com → BATCH_1 (Squads Alpha-Echo)
- employee41-80@company.com → BATCH_2 (Squads Foxtrot-Juliet)

**Test Users:**
- Admin: Full access to all features
- Employee 1: Member of Squad Alpha (BATCH_1)
- Employee 41: Member of Squad Foxtrot (BATCH_2)

## 🛠️ Troubleshooting

### MongoDB Connection Error
```
Error: Error connecting to MongoDB
```
**Solution:** Make sure MongoDB is running
```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Port Already in Use
```
Error: Port 5000 is already in use
```
**Solution:** Change port in `.env` file or kill the process using port 5000

### Token Expired
```
Error: Not authorized to access this route. Invalid token.
```
**Solution:** Login again to get a fresh token

### Cannot Book Seat
```
Error: Buffer bookings can only be made after 3:00 PM
```
**Solution:** Non-scheduled batch members can only book after 3 PM for the next day

### User Not in Squad
```
Error: You must be assigned to a squad to make a booking
```
**Solution:** Admin needs to assign you to a squad first

## 🎓 Next Steps

1. **Read the API Documentation**: Check `API_DOCUMENTATION.md` for complete endpoint reference
2. **Review the Code**: Explore the well-structured codebase
3. **Test Different Scenarios**: Try booking, releasing, and viewing analytics
4. **Customize**: Modify constants in `.env` file
5. **Build Frontend**: When ready, say "continue" to build the React frontend

## 📝 Important Files

| File | Purpose |
|------|---------|
| `server.js` | Main entry point |
| `seed.js` | Database seeder |
| `.env` | Environment configuration |
| `README.md` | Complete documentation |
| `API_DOCUMENTATION.md` | API reference |

## 🔐 Security Notes

- Default passwords are for development only
- Change JWT_SECRET in production
- Use strong passwords for production users
- Enable HTTPS in production
- Add rate limiting for production

## ✅ Success Checklist

- [ ] MongoDB running
- [ ] Dependencies installed
- [ ] Database seeded
- [ ] Server started successfully
- [ ] Health check returns success
- [ ] Logged in as admin
- [ ] Logged in as employee
- [ ] Created a booking
- [ ] Viewed analytics

## 🎉 You're Ready!

Your Smart Seat Booking Backend is now running. Start making API calls and explore the features!

**Default Server URL:** `http://localhost:5000`

**Need Help?**
- Check `README.md` for detailed information
- Review `API_DOCUMENTATION.md` for endpoint details
- Examine the code structure for implementation details

---

**When you're ready to build the frontend, just say "continue"!**
