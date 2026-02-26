const RotationEngine = require('../utils/rotationEngine');
const { BUFFER_BOOKING_TIME } = require('../config/constants');

const parseDateOnly = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  parsed.setHours(0, 0, 0, 0);
  return parsed;
};

/**
 * @desc    Get user's weekly schedule
 * @route   GET /api/schedule/weekly
 * @access  Private
 */
exports.getWeeklySchedule = async (req, res) => {
  try {
    if (!req.user.squad) {
      return res.status(400).json({
        success: false,
        message: 'You must be assigned to a squad to view schedule'
      });
    }

    const userBatch = req.user.squad.batch;
    const today = new Date();

    const schedule = RotationEngine.getWeeklySchedule(userBatch, today);

    res.status(200).json({
      success: true,
      data: {
        userBatch,
        currentWeek: RotationEngine.getRotationWeek(today),
        schedule
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching weekly schedule',
      error: error.message
    });
  }
};

/**
 * @desc    Get multi-week schedule
 * @route   GET /api/schedule/multi-week
 * @access  Private
 */
exports.getMultiWeekSchedule = async (req, res) => {
  try {
    if (!req.user.squad) {
      return res.status(400).json({
        success: false,
        message: 'You must be assigned to a squad to view schedule'
      });
    }

    const weeks = parseInt(req.query.weeks) || 2;
    const userBatch = req.user.squad.batch;

    const schedules = RotationEngine.getMultiWeekSchedule(userBatch, weeks);

    res.status(200).json({
      success: true,
      data: {
        userBatch,
        weeks: schedules
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching multi-week schedule',
      error: error.message
    });
  }
};

/**
 * @desc    Check if user is scheduled for a specific date
 * @route   GET /api/schedule/check/:date
 * @access  Private
 */
exports.checkScheduleForDate = async (req, res) => {
  try {
    if (!req.user.squad) {
      return res.status(400).json({
        success: false,
        message: 'You must be assigned to a squad'
      });
    }

    const date = parseDateOnly(req.params.date);

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date'
      });
    }
    const userBatch = req.user.squad.batch;
    const scheduledBatch = RotationEngine.getScheduledBatch(date);
    const isScheduled = userBatch === scheduledBatch;

    res.status(200).json({
      success: true,
      data: {
        date,
        userBatch,
        scheduledBatch,
        isScheduled,
        canBookNormally: isScheduled,
        canBookBuffer: !isScheduled && RotationEngine.canBookBuffer(),
        dayName: RotationEngine.getDayName(date.getDay())
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking schedule',
      error: error.message
    });
  }
};

/**
 * @desc    Get rotation info
 * @route   GET /api/schedule/rotation-info
 * @access  Private
 */
exports.getRotationInfo = async (req, res) => {
  try {
    const today = new Date();
    const currentWeek = RotationEngine.getRotationWeek(today);
    const scheduledBatch = RotationEngine.getScheduledBatch(today);
    const canBookBuffer = RotationEngine.canBookBuffer();

    res.status(200).json({
      success: true,
      data: {
        currentDate: today,
        rotationWeek: currentWeek,
        scheduledBatchToday: scheduledBatch,
        canBookBufferNow: canBookBuffer,
        bufferBookingTime: `${BUFFER_BOOKING_TIME > 12 ? BUFFER_BOOKING_TIME - 12 : BUFFER_BOOKING_TIME}:00 PM`,
        maxAdvanceBookingWeeks: 2
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching rotation info',
      error: error.message
    });
  }
};
