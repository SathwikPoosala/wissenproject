const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Booking date is required'],
    index: true
  },
  seatNumber: {
    type: Number,
    min: 1,
    max: 50
  },
  batch: {
    type: String,
    enum: ['BATCH_1', 'BATCH_2'],
    required: true
  },
  isBufferBooking: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'released', 'cancelled'],
    default: 'active'
  },
  bookedAt: {
    type: Date,
    default: Date.now
  },
  releasedAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
bookingSchema.index({ date: 1, status: 1 });
bookingSchema.index({ user: 1, date: 1 });
bookingSchema.index({ date: 1, user: 1 }, { unique: true });

// Release booking
bookingSchema.methods.release = async function() {
  this.status = 'released';
  this.releasedAt = new Date();
  await this.save();
  return this;
};

// Check if booking is active
bookingSchema.methods.isActive = function() {
  return this.status === 'active';
};

// Static method to get bookings for a specific date
bookingSchema.statics.getBookingsForDate = async function(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return await this.find({
    date: { $gte: startOfDay, $lte: endOfDay },
    status: 'active'
  }).populate('user', 'name email');
};

// Static method to get active bookings count for a date
bookingSchema.statics.getActiveBookingsCount = async function(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return await this.countDocuments({
    date: { $gte: startOfDay, $lte: endOfDay },
    status: 'active'
  });
};

// Static method to get buffer bookings count for a date
bookingSchema.statics.getBufferBookingsCount = async function(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return await this.countDocuments({
    date: { $gte: startOfDay, $lte: endOfDay },
    status: 'active',
    isBufferBooking: true
  });
};

module.exports = mongoose.model('Booking', bookingSchema);
