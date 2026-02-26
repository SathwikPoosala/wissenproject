const Booking = require('../models/Booking.model');
const User = require('../models/User.model');
const { TOTAL_SEATS, BUFFER_BOOKING_TIME, MEMBERS_PER_BATCH } = require('../config/constants');
const RotationEngine = require('../utils/rotationEngine');

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

const formatHourLabel = (hour24) => {
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:00 ${period}`;
};

const getBufferWindowStartLabel = () => formatHourLabel(BUFFER_BOOKING_TIME);

const getBufferQuotaForDate = async (date, scheduledBatch) => {
  const baseQuota = Math.max(TOTAL_SEATS - MEMBERS_PER_BATCH, 0);

  const releasedScheduledSeats = await Booking.countDocuments({
    date,
    status: 'released',
    isBufferBooking: false,
    batch: scheduledBatch
  });

  const total = baseQuota + releasedScheduledSeats;

  const used = await Booking.countDocuments({
    date,
    status: 'active',
    isBufferBooking: true
  });

  return {
    baseQuota,
    releasedScheduledSeats,
    total,
    used,
    available: Math.max(total - used, 0)
  };
};

/**
 * @desc    Create a booking
 * @route   POST /api/bookings
 * @access  Private (Employee)
 */
exports.createBooking = async (req, res) => {
  try {
    const { date, seatNumber } = req.body;
    const userId = req.user.id;

    // Validate user has a squad
    if (!req.user.squad) {
      return res.status(400).json({
        success: false,
        message: 'You must be assigned to a squad to make a booking'
      });
    }

    const bookingDate = parseDateOnly(date);

    if (!bookingDate) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking date'
      });
    }

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

    // Check if user already has a booking record for this date
    const existingBooking = await Booking.findOne({
      user: userId,
      date: bookingDate
    });

    if (existingBooking && existingBooking.status === 'active') {
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

      // Rule 1: Can only book after configured buffer booking start hour
      if (!RotationEngine.canBookBuffer()) {
        return res.status(400).json({
          success: false,
          message: `Buffer bookings can only be made after ${getBufferWindowStartLabel()}`
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

    const activeBookingsForDate = await Booking.find({
      date: bookingDate,
      status: 'active'
    }).select('seatNumber isBufferBooking');

    const activeBookings = activeBookingsForDate.length;
    
    if (activeBookings >= TOTAL_SEATS) {
      return res.status(400).json({
        success: false,
        message: 'No seats available for this date'
      });
    }

    // For buffer bookings, check if buffer seats are available
    if (isBufferBooking) {
      const bufferQuota = await getBufferQuotaForDate(bookingDate, scheduledBatch);

      if (bufferQuota.available <= 0) {
        return res.status(400).json({
          success: false,
          message: 'No buffer seats available for this date'
        });
      }
    }

    const occupiedSeatNumbers = new Set(
      activeBookingsForDate
        .map((booking) => booking.seatNumber)
        .filter((value) => Number.isInteger(value))
    );

    let assignedSeatNumber = seatNumber;

    if (assignedSeatNumber !== undefined && assignedSeatNumber !== null) {
      const parsedSeatNumber = Number(assignedSeatNumber);

      if (!Number.isInteger(parsedSeatNumber) || parsedSeatNumber < 1 || parsedSeatNumber > TOTAL_SEATS) {
        return res.status(400).json({
          success: false,
          message: `Seat number must be between 1 and ${TOTAL_SEATS}`
        });
      }

      if (occupiedSeatNumbers.has(parsedSeatNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Selected seat is already booked'
        });
      }

      assignedSeatNumber = parsedSeatNumber;
    } else {
      for (let seat = 1; seat <= TOTAL_SEATS; seat++) {
        if (!occupiedSeatNumbers.has(seat)) {
          assignedSeatNumber = seat;
          break;
        }
      }

      if (!assignedSeatNumber) {
        return res.status(400).json({
          success: false,
          message: 'No seats available for this date'
        });
      }
    }

    let booking;

    if (existingBooking && (existingBooking.status === 'released' || existingBooking.status === 'cancelled')) {
      existingBooking.seatNumber = assignedSeatNumber;
      existingBooking.batch = userBatch;
      existingBooking.isBufferBooking = isBufferBooking;
      existingBooking.status = 'active';
      existingBooking.releasedAt = null;
      booking = await existingBooking.save();
    } else {
      booking = await Booking.create({
        user: userId,
        date: bookingDate,
        seatNumber: assignedSeatNumber,
        batch: userBatch,
        isBufferBooking: isBufferBooking,
        status: 'active'
      });
    }

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
 * @desc    Get seat map for a specific date
 * @route   GET /api/bookings/seat-map/:date
 * @access  Private
 */
exports.getSeatMap = async (req, res) => {
  try {
    if (!req.user.squad) {
      return res.status(400).json({
        success: false,
        message: 'You must be assigned to a squad to view seat map'
      });
    }

    const date = parseDateOnly(req.params.date);

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date'
      });
    }

    if (!RotationEngine.isWeekday(date)) {
      return res.status(400).json({
        success: false,
        message: 'Seat map is available only for weekdays'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot view seat map for past dates'
      });
    }

    const userBatch = req.user.squad.batch;
    const scheduledBatch = RotationEngine.getScheduledBatch(date);
    const isUserScheduled = userBatch === scheduledBatch;

    const tomorrow = RotationEngine.getNextBufferBookingDate();
    const isTomorrow = date.getTime() === tomorrow.getTime();
    const isBufferWindowOpen = RotationEngine.canBookBuffer();
    const bufferQuota = await getBufferQuotaForDate(date, scheduledBatch);
    const canBookBuffer = !isUserScheduled && isTomorrow && isBufferWindowOpen && bufferQuota.available > 0;
    const canUserBook = isUserScheduled || canBookBuffer;

    let bufferReason = null;
    if (!isUserScheduled) {
      if (!isTomorrow) {
        bufferReason = 'Buffer seats can only be booked one day in advance from 3:00 PM to 12:00 AM.';
      } else if (!isBufferWindowOpen) {
        bufferReason = `Buffer booking opens at ${getBufferWindowStartLabel()}.`;
      } else if (bufferQuota.available <= 0) {
        bufferReason = 'No buffer seats are available for this date.';
      }
    }

    const bookings = await Booking.find({
      date,
      status: 'active'
    }).populate('user', 'name email');

    const bookedBySeat = new Map();
    bookings.forEach((booking) => {
      if (Number.isInteger(booking.seatNumber)) {
        bookedBySeat.set(booking.seatNumber, booking);
      }
    });

    const isFull = bookings.length >= TOTAL_SEATS;

    const seats = Array.from({ length: TOTAL_SEATS }, (_, index) => {
      const number = index + 1;
      const booking = bookedBySeat.get(number);

      if (booking) {
        const isMine = booking.user && booking.user._id.toString() === req.user.id;
        return {
          seatNumber: number,
          status: isMine ? 'your-booking' : 'full',
          isBooked: true,
          isMine,
          bookedBy: booking.user ? booking.user.name : null,
          bookingType: booking.isBufferBooking ? 'buffer' : 'regular'
        };
      }

      if (!canUserBook || isFull) {
        return {
          seatNumber: number,
          status: 'full',
          isBooked: false,
          isMine: false,
          bookedBy: null,
          bookingType: null
        };
      }

      if (!isUserScheduled) {
        return {
          seatNumber: number,
          status: canBookBuffer ? 'buffer' : 'full',
          isBooked: false,
          isMine: false,
          bookedBy: null,
          bookingType: null
        };
      }

      return {
        seatNumber: number,
        status: 'available',
        isBooked: false,
        isMine: false,
        bookedBy: null,
        bookingType: null
      };
    });

    res.status(200).json({
      success: true,
      data: {
        date,
        scheduledBatch,
        userBatch,
        isUserScheduled,
        canBookBuffer,
        canUserBook,
        isFull,
        bufferQuota,
        bufferReason,
        seats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching seat map',
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
 * @desc    Release seat intent for a scheduled day by date
 * @route   PUT /api/bookings/release-by-date
 * @access  Private
 */
exports.releaseSeatByDate = async (req, res) => {
  try {
    if (!req.user.squad) {
      return res.status(400).json({
        success: false,
        message: 'You must be assigned to a squad to release a seat'
      });
    }

    const { date } = req.body;
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    const bookingDate = parseDateOnly(date);

    if (!bookingDate) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date'
      });
    }

    if (!RotationEngine.isWeekday(bookingDate)) {
      return res.status(400).json({
        success: false,
        message: 'Seat release is allowed only for weekdays'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot release past dates'
      });
    }

    const userBatch = req.user.squad.batch;
    const scheduledBatch = RotationEngine.getScheduledBatch(bookingDate);
    const isScheduled = userBatch === scheduledBatch;

    if (!isScheduled) {
      return res.status(400).json({
        success: false,
        message: 'You can release only your scheduled batch day'
      });
    }

    let booking = await Booking.findOne({
      user: req.user.id,
      date: bookingDate
    });

    if (!booking) {
      booking = await Booking.create({
        user: req.user.id,
        date: bookingDate,
        batch: userBatch,
        isBufferBooking: false,
        status: 'released',
        releasedAt: new Date()
      });

      return res.status(200).json({
        success: true,
        message: 'Seat released for the scheduled day',
        data: booking
      });
    }

    if (booking.status === 'released') {
      return res.status(200).json({
        success: true,
        message: 'Seat is already released for this date',
        data: booking
      });
    }

    booking.status = 'released';
    booking.releasedAt = new Date();
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Seat released for the scheduled day',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error releasing seat for date',
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
    const date = parseDateOnly(req.params.date);

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date'
      });
    }

    const activeBookings = await Booking.getActiveBookingsCount(date);
    const bufferBookings = await Booking.getBufferBookingsCount(date);
    const availableSeats = TOTAL_SEATS - activeBookings;

    const scheduledBatch = RotationEngine.getScheduledBatch(date);
    const userBatch = req.user.squad ? req.user.squad.batch : null;
    const isUserScheduled = userBatch === scheduledBatch;
    const bufferQuota = await getBufferQuotaForDate(date, scheduledBatch);
    const tomorrow = RotationEngine.getNextBufferBookingDate();
    const isTomorrow = date.getTime() === tomorrow.getTime();

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
        canBookBuffer: !isUserScheduled && isTomorrow && RotationEngine.canBookBuffer() && bufferQuota.available > 0,
        bufferQuota
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
