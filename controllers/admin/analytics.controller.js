const Booking = require('../models/Booking.model');
const User = require('../models/User.model');
const Squad = require('../models/Squad.model');
const { TOTAL_SEATS } = require('../config/constants');
const RotationEngine = require('../utils/rotationEngine');

/**
 * @desc    Get daily seat utilization
 * @route   GET /api/admin/analytics/daily/:date
 * @access  Admin
 */
exports.getDailyUtilization = async (req, res) => {
  try {
    const date = new Date(req.params.date);
    date.setHours(0, 0, 0, 0);

    const bookings = await Booking.getBookingsForDate(date);
    const activeCount = await Booking.getActiveBookingsCount(date);
    const bufferCount = await Booking.getBufferBookingsCount(date);

    const scheduledBatch = RotationEngine.getScheduledBatch(date);
    const utilization = ((activeCount / TOTAL_SEATS) * 100).toFixed(2);

    res.status(200).json({
      success: true,
      data: {
        date: date,
        scheduledBatch,
        totalSeats: TOTAL_SEATS,
        bookedSeats: activeCount,
        bufferBookings: bufferCount,
        availableSeats: TOTAL_SEATS - activeCount,
        utilizationPercentage: utilization,
        bookings: bookings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching daily utilization',
      error: error.message
    });
  }
};

/**
 * @desc    Get weekly analytics
 * @route   GET /api/admin/analytics/weekly
 * @access  Admin
 */
exports.getWeeklyAnalytics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekData = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      const activeCount = await Booking.getActiveBookingsCount(currentDate);
      const bufferCount = await Booking.getBufferBookingsCount(currentDate);
      const scheduledBatch = RotationEngine.getScheduledBatch(currentDate);

      weekData.push({
        date: new Date(currentDate),
        dayName: RotationEngine.getDayName(currentDate.getDay()),
        scheduledBatch,
        totalBookings: activeCount,
        bufferBookings: bufferCount,
        regularBookings: activeCount - bufferCount,
        availableSeats: TOTAL_SEATS - activeCount,
        utilization: ((activeCount / TOTAL_SEATS) * 100).toFixed(2)
      });
    }

    res.status(200).json({
      success: true,
      data: weekData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching weekly analytics',
      error: error.message
    });
  }
};

/**
 * @desc    Get system overview
 * @route   GET /api/admin/analytics/overview
 * @access  Admin
 */
exports.getSystemOverview = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'employee' });
    const totalSquads = await Squad.countDocuments();
    const assignedUsers = await User.countDocuments({ squad: { $ne: null }, role: 'employee' });
    const unassignedUsers = totalUsers - assignedUsers;

    const batch1Squads = await Squad.countDocuments({ batch: 'BATCH_1' });
    const batch2Squads = await Squad.countDocuments({ batch: 'BATCH_2' });

    // Get today's bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayBookings = await Booking.getActiveBookingsCount(today);
    const todayBufferBookings = await Booking.getBufferBookingsCount(today);

    res.status(200).json({
      success: true,
      data: {
        system: {
          totalSeats: TOTAL_SEATS,
          totalSquads: totalSquads,
          totalEmployees: totalUsers,
          assignedEmployees: assignedUsers,
          unassignedEmployees: unassignedUsers
        },
        batches: {
          batch1: {
            squads: batch1Squads,
            expectedMembers: batch1Squads * 8
          },
          batch2: {
            squads: batch2Squads,
            expectedMembers: batch2Squads * 8
          }
        },
        today: {
          date: today,
          scheduledBatch: RotationEngine.getScheduledBatch(today),
          totalBookings: todayBookings,
          bufferBookings: todayBufferBookings,
          availableSeats: TOTAL_SEATS - todayBookings,
          utilization: ((todayBookings / TOTAL_SEATS) * 100).toFixed(2)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching system overview',
      error: error.message
    });
  }
};

/**
 * @desc    Get booking history with filters
 * @route   GET /api/admin/analytics/bookings
 * @access  Admin
 */
exports.getBookingHistory = async (req, res) => {
  try {
    const { startDate, endDate, userId, batch, status } = req.query;

    let query = {};

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (userId) {
      query.user = userId;
    }

    if (batch) {
      query.batch = batch;
    }

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name email squad')
      .sort({ date: -1, bookedAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching booking history',
      error: error.message
    });
  }
};

/**
 * @desc    Get squad-wise analytics
 * @route   GET /api/admin/analytics/squads
 * @access  Admin
 */
exports.getSquadAnalytics = async (req, res) => {
  try {
    const squads = await Squad.find().populate('members', 'name email');

    const squadData = await Promise.all(squads.map(async (squad) => {
      // Get bookings for squad members in the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const memberIds = squad.members.map(m => m._id);

      const bookingCount = await Booking.countDocuments({
        user: { $in: memberIds },
        date: { $gte: sevenDaysAgo },
        status: 'active'
      });

      return {
        squadId: squad._id,
        squadName: squad.name,
        batch: squad.batch,
        memberCount: squad.members.length,
        maxMembers: squad.maxMembers,
        bookingsLast7Days: bookingCount,
        averageBookingsPerMember: squad.members.length > 0 
          ? (bookingCount / squad.members.length).toFixed(2) 
          : 0
      };
    }));

    res.status(200).json({
      success: true,
      data: squadData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching squad analytics',
      error: error.message
    });
  }
};
