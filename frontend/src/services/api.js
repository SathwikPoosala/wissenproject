import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  updateProfile: async (userData) => {
    const response = await api.put('/auth/updatedetails', userData);
    return response.data;
  },
  
  updatePassword: async (passwords) => {
    const response = await api.put('/auth/updatepassword', passwords);
    return response.data;
  },
};

// Booking Services
export const bookingService = {
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },
  
  getMyBookings: async (params) => {
    const response = await api.get('/bookings/my-bookings', { params });
    return response.data;
  },
  
  getUpcomingBookings: async () => {
    const response = await api.get('/bookings/upcoming');
    return response.data;
  },
  
  releaseBooking: async (bookingId) => {
    const response = await api.put(`/bookings/${bookingId}/release`);
    return response.data;
  },

  releaseSeatByDate: async (date) => {
    const response = await api.put('/bookings/release-by-date', { date });
    return response.data;
  },
  
  getAvailability: async (date) => {
    const response = await api.get(`/bookings/availability/${date}`);
    return response.data;
  },

  getSeatMap: async (date) => {
    const response = await api.get(`/bookings/seat-map/${date}`);
    return response.data;
  },
  
  getMyStats: async () => {
    const response = await api.get('/bookings/stats');
    return response.data;
  },
};

// Schedule Services
export const scheduleService = {
  getWeeklySchedule: async () => {
    const response = await api.get('/schedule/weekly');
    return response.data;
  },
  
  getMultiWeekSchedule: async (weeks = 2) => {
    const response = await api.get(`/schedule/multi-week?weeks=${weeks}`);
    return response.data;
  },
  
  checkScheduleForDate: async (date) => {
    const response = await api.get(`/schedule/check/${date}`);
    return response.data;
  },
  
  getRotationInfo: async () => {
    const response = await api.get('/schedule/rotation-info');
    return response.data;
  },
};

// Admin Services
export const adminService = {
  // Squad Management
  getAllSquads: async () => {
    const response = await api.get('/admin/squads');
    return response.data;
  },
  
  getSquad: async (squadId) => {
    const response = await api.get(`/admin/squads/${squadId}`);
    return response.data;
  },
  
  createSquad: async (squadData) => {
    const response = await api.post('/admin/squads', squadData);
    return response.data;
  },
  
  updateSquad: async (squadId, squadData) => {
    const response = await api.put(`/admin/squads/${squadId}`, squadData);
    return response.data;
  },
  
  deleteSquad: async (squadId) => {
    const response = await api.delete(`/admin/squads/${squadId}`);
    return response.data;
  },
  
  addMemberToSquad: async (squadId, userId) => {
    const response = await api.post(`/admin/squads/${squadId}/members`, { userId });
    return response.data;
  },
  
  removeMemberFromSquad: async (squadId, userId) => {
    const response = await api.delete(`/admin/squads/${squadId}/members/${userId}`);
    return response.data;
  },
  
  // User Management
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  
  getUser: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },
  
  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },
  
  updateUser: async (userId, userData) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },
  
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
  
  getUnassignedUsers: async () => {
    const response = await api.get('/admin/users/unassigned');
    return response.data;
  },
  
  // Analytics
  getSystemOverview: async () => {
    const response = await api.get('/admin/analytics/overview');
    return response.data;
  },
  
  getWeeklyAnalytics: async () => {
    const response = await api.get('/admin/analytics/weekly');
    return response.data;
  },
  
  getDailyUtilization: async (date) => {
    const response = await api.get(`/admin/analytics/daily/${date}`);
    return response.data;
  },
  
  getBookingHistory: async (params) => {
    const response = await api.get('/admin/analytics/bookings', { params });
    return response.data;
  },
  
  getSquadAnalytics: async () => {
    const response = await api.get('/admin/analytics/squads');
    return response.data;
  },
};

export default api;
