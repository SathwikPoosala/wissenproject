const Booking = require('../models/Booking.model');
const User = require('../models/User.model');
const { TOTAL_SEATS } = require('../config/constants');
const RotationEngine = require('../utils/rotationEngine');

/**
 * @desc    Create a booking
 * @route   POST /api/bookings
 * @access  Private (Employee)
 */
exports.createBooking = async (req, res) => {
  try {
    const { date } = req.body;
    const userId = req.user.id;

    // Validate user has a squad
    if (!req.user.squad) {
      return res.status(400).json({
        success: false,
        message: 'You must be assigned to a squad to make a booking'
      });
    }

    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);

    // Check if date is a weekday
    if (!RotationEngine.isWeekday(bookingDate)) {
      return res.status(400).json({
        success: false,
        message: 'Bookings can only be made for weekdays (Monday-Friday)'
      });
    }

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book for past dates'
      });
    }

    // Get user's batch
    const userBatch = req.user.squad.batch;
    const scheduledBatch = RotationEngine.getScheduledBatch(bookingDate);
    const isScheduled = userBatch === scheduledBatch;

    // Check if user already has a booking for this date
    const existingBooking = await Booking.findOne({
      user: userId,
      date: bookingDate,
      status: 'active'
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active booking for this date'
      });
    }

    let isBufferBooking = false;

    // If user is in scheduled batch
    if (isScheduled) {
      // Check if within 2 weeks advance booking limit
      if (!RotationEngine.isDateWithinBookingRange(bookingDate, 2)) {
        return res.status(400).json({
          success: false,
          message: 'You can only book up to 2 weeks in advance'
        });
      }
    } else {
      // User is NOT in scheduled batch - check buffer booking rules
      isBufferBooking = true;

      // Rule 1: Can only book after 3 PM
      if (!RotationEngine.canBookBuffer()) {
        return res.status(400).json({
          success: false,
          message: 'Buffer bookings can only be made after 3:00 PM'
        });
      }

      // Rule 2: Can only book for next day
      const tomorrow = RotationEngine.getNextBufferBookingDate();
      if (bookingDate.getTime() !== tomorrow.getTime()) {
        return res.status(400).json({
          success: false,
          message: 'Buffer bookings can only be made for the next day'
        });
      }
    }

    // Check seat availability
    const activeBookings = await Booking.getActiveBookingsCount(bookingDate);
    
    if (activeBookings >= TOTAL_SEATS) {
      return res.status(400).json({
        success: false,
        message: 'No seats available for this date'
      });
    }

    // For buffer bookings, check if buffer seats are available
    if (isBufferBooking) {
      const bufferSeats = TOTAL_SEATS - activeBookings;
      if (bufferSeats <= 0) {
        return res.status(400).json({
          success: false,
          message: 'No buffer seats available for this date'
        });
      }
    }

    // Create booking
    const booking = await Booking.create({
      user: userId,
      date: bookingDate,
      batch: userBatch,
      isBufferBooking: isBufferBooking,
      status: 'active'
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: `${isBufferBooking ? 'Buffer ' : ''}Booking created successfully`,
      data: populatedBooking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
};

/**
 * @desc    Get user's bookings
 * @route   GET /api/bookings/my-bookings
 * @access  Private
 */
exports.getMyBookings = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;

    let query = { user: req.user.id };

    if (status) {
      query.status = status;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const bookings = await Booking.find(query)
      .sort({ date: 1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
};

/**
 * @desc    Get upcoming bookings for user
 * @route   GET /api/bookings/upcoming
 * @access  Private
 */
exports.getUpcomingBookings = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookings = await Booking.find({
      user: req.user.id,
      date: { $gte: today },
      status: 'active'
    })
    .sort({ date: 1 })
    .limit(20);

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming bookings',
      error: error.message
    });
  }
};

/**
 * @desc    Release a booking
 * @route   PUT /api/bookings/:id/release
 * @access  Private
 */
exports.releaseBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify booking belongs to user
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to release this booking'
      });
    }

    // Check if booking is already released
    if (booking.status === 'released') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already released'
      });
    }

    // Check if booking date has passed
    const bookingDate = new Date(booking.date);
    bookingDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot release past bookings'
      });
    }

    await booking.release();

    res.status(200).json({
      success: true,
      message: 'Booking released successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error releasing booking',
      error: error.message
    });
  }
};

/**
 * @desc    Get available seats for a date
 * @route   GET /api/bookings/availability/:date
 * @access  Private
 */
exports.getAvailability = async (req, res) => {
  try {
    const date = new Date(req.params.date);
    date.setHours(0, 0, 0, 0);

    const activeBookings = await Booking.getActiveBookingsCount(date);
    const bufferBookings = await Booking.getBufferBookingsCount(date);
    const availableSeats = TOTAL_SEATS - activeBookings;

    const scheduledBatch = RotationEngine.getScheduledBatch(date);
    const userBatch = req.user.squad ? req.user.squad.batch : null;
    const isUserScheduled = userBatch === scheduledBatch;

    res.status(200).json({
      success: true,
      data: {
        date: date,
        totalSeats: TOTAL_SEATS,
        bookedSeats: activeBookings,
        bufferBookings: bufferBookings,
        availableSeats: availableSeats,
        scheduledBatch: scheduledBatch,
        userBatch: userBatch,
        isUserScheduled: isUserScheduled,
        canBook: availableSeats > 0,
        canBookBuffer: !isUserScheduled && availableSeats > 0 && RotationEngine.canBookBuffer()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching availability',
      error: error.message
    });
  }
};

/**
 * @desc    Get booking statistics for user
 * @route   GET /api/bookings/stats
 * @access  Private
 */
exports.getMyStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalBookings = await Booking.countDocuments({
      user: req.user.id,
      status: 'active',
      date: { $gte: thirtyDaysAgo }
    });

    const bufferBookings = await Booking.countDocuments({
      user: req.user.id,
      status: 'active',
      isBufferBooking: true,
      date: { $gte: thirtyDaysAgo }
    });

    const releasedBookings = await Booking.countDocuments({
      user: req.user.id,
      status: 'released',
      date: { $gte: thirtyDaysAgo }
    });

    const upcomingBookings = await Booking.countDocuments({
      user: req.user.id,
      status: 'active',
      date: { $gte: new Date() }
    });

    res.status(200).json({
      success: true,
      data: {
        period: 'Last 30 days',
        totalBookings,
        bufferBookings,
        regularBookings: totalBookings - bufferBookings,
        releasedBookings,
        upcomingBookings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};
