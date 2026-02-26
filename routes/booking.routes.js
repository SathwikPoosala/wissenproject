const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getUpcomingBookings,
  releaseBooking,
  getAvailability,
  getMyStats
} = require('../controllers/booking.controller');
const { protect, requireSquad } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

// Booking routes
router.post('/', requireSquad, createBooking);
router.get('/my-bookings', getMyBookings);
router.get('/upcoming', getUpcomingBookings);
router.get('/stats', getMyStats);
router.get('/availability/:date', getAvailability);
router.put('/:id/release', releaseBooking);

module.exports = router;
