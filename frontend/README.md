# Smart Seat Booking - Frontend

Modern, interactive React frontend for the Smart Seat Booking System.

## Features

- Clean, professional UI with modern design
- Role-based dashboards (Admin & Employee)
- Interactive seat booking calendar
- Real-time seat availability
- Comprehensive analytics with charts
- Responsive design for all devices
- Beautiful color schemes and icons

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool & dev server
- **React Router v6** - Routing
- **Axios** - HTTP client
- **React Icons** - Icon library
- **Recharts** - Data visualization
- **React Toastify** - Notifications
- **date-fns** - Date manipulation

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Backend server running on port 5000

### Installation

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file (optional):
```bash
# Create .env file
VITE_API_URL=http://localhost:5000/api
```

4. Start development server:
```bash
npm run dev
```

The application will open at `http://localhost:3000`

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable components
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Input/
│   │   ├── Loading/
│   │   ├── Navbar/
│   │   └── ProtectedRoute/
│   ├── context/          # React Context
│   │   └── AuthContext.jsx
│   ├── pages/            # Page components
│   │   ├── Login/
│   │   ├── Dashboard/
│   │   └── Admin/
│   │       ├── Dashboard/
│   │       └── Squads/
│   ├── services/         # API services
│   │   └── api.js
│   ├── App.jsx           # Main app component
│   ├── App.css           # App styles
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## Features by Role

### Employee Dashboard

- **Weekly Schedule View**
  - Color-coded calendar showing scheduled days
  - Visual indication of booked vs available days
  - Buffer booking availability

- **Quick Booking**
  - One-click seat booking for scheduled days
  - Buffer seat booking after 3 PM for next day
  - Easy booking release/cancellation

- **Statistics**
  - Total bookings in last 30 days
  - Upcoming confirmed seats
  - Buffer booking usage
  - Released bookings

- **Booking Management**
  - View all upcoming bookings
  - Release bookings before the date
  - Booking history

### Admin Dashboard

- **System Overview**
  - Total employees and assignments
  - Total squads and seats
  - Today's utilization percentage
  - Real-time booking stats

- **Analytics & Charts**
  - Weekly utilization bar chart
  - Batch distribution pie chart
  - Squad performance metrics
  - Booking trends

- **Squad Management**
  - Create and manage squads
  - Assign employees to squads
  - Set batch allocations
  - View squad statistics

- **User Management**
  - View all employees
  - Create new users
  - Assign to squads
  - Manage user status

## Components

### Button
```jsx
<Button 
  variant="primary"    // primary, secondary, success, danger, outline, ghost
  size="medium"        // small, medium, large
  icon={<FiCheck />}
  loading={false}
  fullWidth={false}
  onClick={handleClick}
>
  Click Me
</Button>
```

### Card
```jsx
<Card 
  title="Card Title"
  subtitle="Subtitle text"
  icon={<FiIcon />}
  action={<Button>Action</Button>}
>
  Card content
</Card>
```

### Input
```jsx
<Input
  label="Email"
  type="email"
  name="email"
  value={value}
  onChange={handleChange}
  icon={<FiMail />}
  placeholder="Enter email"
  required
/>
```

## Color Scheme

The app uses a professional color palette:

- **Primary**: Indigo (#4F46E5) - Main brand color
- **Secondary**: Sky Blue (#0EA5E9) - Secondary actions
- **Accent**: Purple (#8B5CF6) - Highlights
- **Success**: Green (#10B981) - Success states
- **Warning**: Amber (#F59E0B) - Warning states
- **Error**: Red (#EF4444) - Error states

## API Integration

All API calls are handled through the `services/api.js` file:

```javascript
import { bookingService, scheduleService, adminService } from './services/api';

// Example usage
const bookings = await bookingService.getMyBookings();
const schedule = await scheduleService.getWeeklySchedule();
const overview = await adminService.getSystemOverview();
```

## Authentication

The app uses JWT tokens stored in localStorage:

- Login redirects based on role (admin/employee)
- Protected routes check authentication
- Auto-logout on token expiration
- Persistent login across page refreshes

## Responsive Design

The UI is fully responsive with breakpoints:

- **Desktop**: 1024px and above
- **Tablet**: 768px - 1023px  
- **Mobile**: Below 768px

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

## Preview Production Build

```bash
npm run preview
```

## Demo Credentials

**Admin:**
- Email: admin@company.com
- Password: admin123

**Employee:**
- Email: employee1@company.com
- Password: employee123

## Key Features Implemented

✅ Modern, clean UI design  
✅ Beautiful color combinations  
✅ Interactive components  
✅ Icon-based navigation  
✅ Real-time updates  
✅ Loading states & error handling  
✅ Toast notifications  
✅ Responsive layout  
✅ Data visualization with charts  
✅ Role-based access control  
✅ Protected routes  
✅ Form validation  
✅ Smooth animations  
✅ Professional navbar  
✅ Dashboard widgets  
✅ Calendar booking interface  

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Fast HMR (Hot Module Replacement) with Vite
- Optimized bundle size
- Code splitting
- Lazy loading for better performance

## Future Enhancements

- Dark mode toggle
- Advanced filtering and search
- Export reports to PDF/Excel
- Email notifications integration
- Mobile app version
- Real-time updates with WebSockets
- Calendar integration (Google Calendar, Outlook)
- Multi-language support

## Troubleshooting

**Issue**: Cannot connect to backend
- **Solution**: Ensure backend is running on port 5000

**Issue**: Login fails
- **Solution**: Check if database is seeded with users

**Issue**: White screen after build
- **Solution**: Check browser console for errors, ensure environment variables are set

## Contributing

1. Follow the existing code structure
2. Use the established color scheme
3. Maintain responsive design
4. Add proper error handling
5. Include loading states

## License

ISC

---

**Built with modern React and professional UI/UX principles**
