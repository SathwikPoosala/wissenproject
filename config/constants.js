module.exports = {
  TOTAL_SEATS: parseInt(process.env.TOTAL_SEATS) || 50,
  TOTAL_SQUADS: parseInt(process.env.TOTAL_SQUADS) || 10,
  MEMBERS_PER_SQUAD: parseInt(process.env.MEMBERS_PER_SQUAD) || 8,
  TOTAL_EMPLOYEES: 80,
  SQUADS_PER_BATCH: 5,
  MEMBERS_PER_BATCH: 40,
  BUFFER_BOOKING_TIME: parseInt(process.env.BUFFER_BOOKING_TIME) || 15, // 3:00 PM = 15:00
  MAX_ADVANCE_BOOKING_WEEKS: parseInt(process.env.MAX_ADVANCE_BOOKING_WEEKS) || 2,
  
  BATCH_TYPES: {
    BATCH_1: 'BATCH_1',
    BATCH_2: 'BATCH_2'
  },
  
  ROLES: {
    ADMIN: 'admin',
    EMPLOYEE: 'employee'
  },
  
  BOOKING_STATUS: {
    ACTIVE: 'active',
    RELEASED: 'released',
    CANCELLED: 'cancelled'
  }
};
