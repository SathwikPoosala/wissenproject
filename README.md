# Smart Seat Booking Web Application

A complete full-stack web application for managing smart seat bookings in a company that follows a rotational hybrid work model.

## 🎯 Overview

This system manages seat bookings for a company with:
- **80 employees** divided into **10 squads** (8 members each)
- **50 total seats** available
- **2 batches** rotating weekly between office and remote work
- **Dynamic buffer seat** allocation system
- **Modern React frontend** with clean, interactive UI
- **RESTful API backend** with MongoDB

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

### Backend
- **Runtime**: Node.js v14+
- **Framework**: Express.js 4.18
- **Database**: MongoDB 7.5 with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing

### Frontend
- **Framework**: React 18.2
- **Build Tool**: Vite 5.0
- **Routing**: React Router DOM 6.20
- **HTTP Client**: Axios 1.6
- **Icons**: React Icons 4.12
- **Charts**: Recharts 2.10
- **Notifications**: React Toastify 3.0
- **Date Utils**: date-fns 2.30

## 📁 Project Structure

```
wissen project/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── admin/               # Admin controllers
│   ├── auth.controller.js
│   ├── booking.controller.js
│   └── schedule.controller.js
├── middleware/
│   └── auth.middleware.js   # JWT authentication
├── models/
│   ├── User.model.js        # User schema
│   ├── Squad.model.js       # Squad schema
│   └── Booking.model.js     # Booking schema
├── routes/
│   ├── admin/               # Admin routes
│   ├── auth.routes.js
│   ├── booking.routes.js
│   └── schedule.routes.js
├── utils/
│   ├── rotationEngine.js    # Core rotation logic
│   └── auth.utils.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Button/
│   │   │   ├── Card/
│   │   │   ├── Input/
│   │   │   ├── Loading/
│   │   │   ├── Navbar/
│   │   │   └── ProtectedRoute/
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login/
│   │   │   ├── Dashboard/
│   │   │   └── Admin/
│   │   │       ├── Dashboard/
│   │   │       └── Squads/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
├── .env
├── .gitignore
├── package.json
├── seed.js
├── server.js                # Backend entry point
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v7.0 or higher)
- npm or yarn

### Step 1: Backend Setup

1. **Navigate to project root directory**
   ```bash
   cd "wissen project"
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   The `.env` file should already exist in the root folder with:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/smart-seat-booking
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system (or use MongoDB Atlas)

5. **Seed the database** (first time only)
   ```bash
   node seed.js
   ```
   
   This creates:
   - 1 Admin user
   - 10 Squads (5 per batch)
   - 80 Employees (8 per squad)

6. **Start the backend server**
   ```bash
   npm start
   ```
   
   The backend runs on `http://localhost:5000`

### Step 2: Frontend Setup

1. **Open a new terminal and navigate to frontend directory**
   ```bash
   cd "wissen project/frontend"
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   The `.env` file should already exist in the frontend folder:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The frontend runs on `http://localhost:3000`

5. **Access the application**
   
   Open your browser and navigate to: `http://localhost:3000`

## 🔑 Default Credentials (After Seeding)

**Admin:**
- Email: `admin@company.com`
- Password: `admin123`

**Employees:**
- Email: `employee1@company.com` to `employee80@company.com`
- Password: `employee123`

## 🎨 UI Features

### Design Principles
- **Clean & Modern**: Professional gradient-based design
- **Interactive**: Smooth transitions, hover effects, and animations
- **Responsive**: Works seamlessly on desktop, tablet, and mobile
- **Accessible**: Icon-based navigation with clear visual hierarchy

### Color Scheme
- **Primary**: #4F46E5 (Indigo) - Main brand color
- **Secondary**: #0EA5E9 (Sky Blue) - Secondary actions
- **Accent**: #8B5CF6 (Purple) - Highlights
- **Success**: #10B981 (Green) - Success states
- **Warning**: #F59E0B (Amber) - Warning states
- **Error**: #EF4444 (Red) - Error states

### Employee Dashboard
- 📊 **Statistics Cards**: Quick view of bookings, releases, and buffer usage
- 📅 **Weekly Calendar**: Color-coded schedule showing scheduled/buffer/booked days
- 🪑 **Quick Booking**: One-click seat booking for scheduled days
- 📝 **Booking List**: View and manage all upcoming bookings
- ⏰ **Buffer Booking**: After 3 PM booking for next day

### Admin Dashboard
- 📈 **Analytics Charts**: Weekly utilization bar chart, batch distribution pie chart
- 👥 **System Overview**: Total employees, squads, seats, and utilization
- 🏆 **Squad Performance**: Individual squad statistics and metrics
- 🔧 **Management Tools**: Squad CRUD operations, user management

### Component Library
- **Buttons**: 6 variants (primary, secondary, success, danger, outline, ghost)
- **Cards**: Flexible container with title, subtitle, icons, and actions
- **Inputs**: Styled form inputs with icon support and validation
- **Navbar**: Professional navigation with user dropdown and role-based menu
- **Loading**: Smooth loading states for better UX
- **Modals**: Clean modal dialogs for create/edit operations

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
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Mobile app version
- [ ] Real-time updates with WebSockets
- [ ] Export reports to PDF/Excel
- [ ] Dark mode theme
- [ ] Multi-language support
- [ ] Advanced analytics dashboard

## 🏗️ Production Build

### Backend Production
```bash
cd backend
npm start
```

### Frontend Production
```bash
cd frontend
npm run build
```

The production build will be created in `frontend/dist/`

To preview the production build:
```bash
npm run preview
```

## 🔍 Troubleshooting

### Backend won't start
- ✅ Check if MongoDB is running
- ✅ Verify `.env` file exists with correct values
- ✅ Check port 5000 is not in use
- ✅ Run `npm install` to ensure dependencies are installed

### Frontend won't connect to backend
- ✅ Verify backend is running on port 5000
- ✅ Check `VITE_API_URL` in `frontend/.env`
- ✅ Look for CORS errors in browser console
- ✅ Clear browser cache and restart dev server

### Login fails
- ✅ Ensure database is seeded: `node seed.js` in project root
- ✅ Check email/password matches seeded data
- ✅ Verify `JWT_SECRET` is set in `.env` (root folder)
- ✅ Check browser console for error messages

### Cannot create bookings
- ✅ Check if user is assigned to a squad
- ✅ Verify the date is a scheduled day for the user's batch
- ✅ Check seat availability (max 50 seats)
- ✅ Ensure the date is a weekday (Mon-Fri)

### UI not loading properly
- ✅ Clear browser cache
- ✅ Run `npm install` in frontend folder
- ✅ Restart Vite dev server
- ✅ Check browser console for errors

## 🤝 Contributing

1. Follow the existing code structure
2. Add validation for all inputs
3. Include error handling
4. Update documentation for new features

## 📄 License

ISC

## ✨ Features Summary

### Completed Features

**Backend:**
✅ 30+ RESTful API endpoints  
✅ JWT authentication & authorization  
✅ Role-based access control (Admin/Employee)  
✅ MongoDB database with 3 models  
✅ Automated rotation engine  
✅ Buffer booking system  
✅ Complete CRUD operations  
✅ Comprehensive error handling  

**Frontend:**
✅ Modern React 18 with Vite  
✅ Clean, professional UI design  
✅ Interactive dashboards  
✅ Real-time booking management  
✅ Chart-based analytics  
✅ Responsive design  
✅ Protected routing  
✅ Toast notifications  
✅ Loading states  
✅ Form validation  

## 🎯 Quick Start Guide

**Terminal 1 - Backend:**
```bash
cd "wissen project"
npm install
node seed.js
npm start
```

**Terminal 2 - Frontend:**
```bash
cd "wissen project/frontend"
npm install
npm run dev
```

**Login:**
- Open `http://localhost:3000`
- Admin: admin@company.com / admin123
- Employee: employee1@company.com / employee123

---

**Built with modern technologies and best practices for scalable hybrid work management**
