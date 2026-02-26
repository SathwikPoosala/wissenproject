const mongoose = require('mongoose');

const squadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Squad name is required'],
    unique: true,
    trim: true
  },
  batch: {
    type: String,
    enum: ['BATCH_1', 'BATCH_2'],
    required: [true, 'Batch assignment is required']
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  maxMembers: {
    type: Number,
    default: 8
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Validate max members
squadSchema.pre('save', function(next) {
  if (this.members.length > this.maxMembers) {
    next(new Error(`Squad cannot have more than ${this.maxMembers} members`));
  }
  next();
});

// Get current member count
squadSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Check if squad is full
squadSchema.methods.isFull = function() {
  return this.members.length >= this.maxMembers;
};

// Add member to squad
squadSchema.methods.addMember = async function(userId) {
  if (this.isFull()) {
    throw new Error('Squad is already full');
  }
  
  if (this.members.includes(userId)) {
    throw new Error('User is already in this squad');
  }
  
  this.members.push(userId);
  await this.save();
  
  // Update user's squad reference
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(userId, { squad: this._id });
  
  return this;
};

// Remove member from squad
squadSchema.methods.removeMember = async function(userId) {
  this.members = this.members.filter(id => !id.equals(userId));
  await this.save();
  
  // Remove squad reference from user
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(userId, { squad: null });
  
  return this;
};

squadSchema.set('toJSON', { virtuals: true });
squadSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Squad', squadSchema);
