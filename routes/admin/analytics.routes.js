const express = require('express');
const router = express.Router();
const {
  getDailyUtilization,
  getWeeklyAnalytics,
  getSystemOverview,
  getBookingHistory,
  getSquadAnalytics
} = require('../../controllers/admin/analytics.controller');
const { protect, authorize } = require('../../middleware/auth.middleware');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/overview', getSystemOverview);
router.get('/weekly', getWeeklyAnalytics);
router.get('/daily/:date', getDailyUtilization);
router.get('/bookings', getBookingHistory);
router.get('/squads', getSquadAnalytics);

module.exports = router;
