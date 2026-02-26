const { BATCH_TYPES } = require('../config/constants');

/**
 * Rotation Engine for Smart Seat Booking
 * 
 * Rotation Pattern:
 * Week 1: BATCH_1 (Mon-Wed), BATCH_2 (Thu-Fri)
 * Week 2: BATCH_2 (Mon-Wed), BATCH_1 (Thu-Fri)
 * This pattern repeats every 2 weeks
 */

class RotationEngine {
  /**
   * Get the reference start date (beginning of rotation cycle)
   * Using a fixed date to ensure consistent week calculations
   */
  static getReferenceDate() {
    // Using January 1, 2024 as reference (Monday)
    return new Date('2024-01-01T00:00:00Z');
  }

  /**
   * Get the week number since reference date
   * @param {Date} date - The date to check
   * @returns {number} - Week number (0-based)
   */
  static getWeekNumber(date) {
    const referenceDate = this.getReferenceDate();
    const diffTime = Math.abs(date - referenceDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7);
  }

  /**
   * Check if it's Week 1 or Week 2 in the rotation cycle
   * @param {Date} date - The date to check
   * @returns {number} - 1 for Week 1, 2 for Week 2
   */
  static getRotationWeek(date) {
    const weekNumber = this.getWeekNumber(date);
    return (weekNumber % 2) === 0 ? 1 : 2;
  }

  /**
   * Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
   * @param {Date} date - The date to check
   * @returns {number} - Day of week
   */
  static getDayOfWeek(date) {
    return date.getDay();
  }

  /**
   * Get the scheduled batch for a specific date
   * @param {Date} date - The date to check
   * @returns {string} - 'BATCH_1' or 'BATCH_2'
   */
  static getScheduledBatch(date) {
    const rotationWeek = this.getRotationWeek(date);
    const dayOfWeek = this.getDayOfWeek(date);

    // Weekend check
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return null; // No batch scheduled on weekends
    }

    // Week 1 Logic
    if (rotationWeek === 1) {
      // Mon(1), Tue(2), Wed(3) -> BATCH_1
      if (dayOfWeek >= 1 && dayOfWeek <= 3) {
        return BATCH_TYPES.BATCH_1;
      }
      // Thu(4), Fri(5) -> BATCH_2
      if (dayOfWeek === 4 || dayOfWeek === 5) {
        return BATCH_TYPES.BATCH_2;
      }
    }

    // Week 2 Logic
    if (rotationWeek === 2) {
      // Mon(1), Tue(2), Wed(3) -> BATCH_2
      if (dayOfWeek >= 1 && dayOfWeek <= 3) {
        return BATCH_TYPES.BATCH_2;
      }
      // Thu(4), Fri(5) -> BATCH_1
      if (dayOfWeek === 4 || dayOfWeek === 5) {
        return BATCH_TYPES.BATCH_1;
      }
    }

    return null;
  }

  /**
   * Check if a user belongs to the scheduled batch for a date
   * @param {string} userBatch - User's batch (BATCH_1 or BATCH_2)
   * @param {Date} date - The date to check
   * @returns {boolean} - True if user is in scheduled batch
   */
  static isUserInScheduledBatch(userBatch, date) {
    const scheduledBatch = this.getScheduledBatch(date);
    return userBatch === scheduledBatch;
  }

  /**
   * Get weekly schedule for a user
   * @param {string} userBatch - User's batch
   * @param {Date} weekStartDate - Start of the week (Monday)
   * @returns {Array} - Array of schedule objects
   */
  static getWeeklySchedule(userBatch, weekStartDate) {
    const schedule = [];
    const weekStart = new Date(weekStartDate);
    
    // Find the Monday of the week
    const dayOfWeek = weekStart.getDay();
    const diff = weekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(weekStart.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    // Generate schedule for 5 working days
    for (let i = 0; i < 5; i++) {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + i);
      
      const scheduledBatch = this.getScheduledBatch(currentDate);
      const isScheduled = userBatch === scheduledBatch;
      
      schedule.push({
        date: new Date(currentDate),
        dayName: this.getDayName(currentDate.getDay()),
        scheduledBatch: scheduledBatch,
        isUserScheduled: isScheduled,
        canBookNormally: isScheduled,
        canBookBuffer: !isScheduled
      });
    }

    return schedule;
  }

  /**
   * Get day name from day number
   * @param {number} dayNum - Day number (0-6)
   * @returns {string} - Day name
   */
  static getDayName(dayNum) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNum];
  }

  /**
   * Get schedule for next N weeks
   * @param {string} userBatch - User's batch
   * @param {number} weeks - Number of weeks to get schedule for
   * @returns {Array} - Array of weekly schedules
   */
  static getMultiWeekSchedule(userBatch, weeks = 2) {
    const schedules = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() + (i * 7));
      
      const weekSchedule = this.getWeeklySchedule(userBatch, weekStart);
      schedules.push({
        weekNumber: i + 1,
        rotationWeek: this.getRotationWeek(weekStart),
        schedule: weekSchedule
      });
    }

    return schedules;
  }

  /**
   * Check if current time allows buffer booking (after 3 PM)
   * @returns {boolean}
   */
  static canBookBuffer() {
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour >= 15; // 3:00 PM = 15:00
  }

  /**
   * Get next booking date for buffer booking (tomorrow)
   * @returns {Date}
   */
  static getNextBufferBookingDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  /**
   * Validate if a date is within allowed booking range
   * @param {Date} bookingDate - The date to book
   * @param {number} maxWeeks - Maximum weeks in advance (default: 2)
   * @returns {boolean}
   */
  static isDateWithinBookingRange(bookingDate, maxWeeks = 2) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + (maxWeeks * 7));
    
    return bookingDate >= today && bookingDate <= maxDate;
  }

  /**
   * Check if a date is a weekday (Monday-Friday)
   * @param {Date} date
   * @returns {boolean}
   */
  static isWeekday(date) {
    const day = date.getDay();
    return day >= 1 && day <= 5;
  }
}

module.exports = RotationEngine;
