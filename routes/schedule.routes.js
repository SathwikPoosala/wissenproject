const express = require('express');
const router = express.Router();
const {
  getWeeklySchedule,
  getMultiWeekSchedule,
  checkScheduleForDate,
  getRotationInfo
} = require('../controllers/schedule.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

router.get('/weekly', getWeeklySchedule);
router.get('/multi-week', getMultiWeekSchedule);
router.get('/check/:date', checkScheduleForDate);
router.get('/rotation-info', getRotationInfo);

module.exports = router;
