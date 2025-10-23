const mongoose = require('mongoose');

const verificationSettingsSchema = new mongoose.Schema({
  autoVerificationEnabled: {
    type: Boolean,
    default: false
  },
  waitingPeriod: {
    type: String,
    enum: ['none', '1day', '3days', '1week', '2weeks', '1month'],
    default: '1week'
  },
  waitingPeriodDays: {
    type: Number,
    default: 7  // Calculated from waitingPeriod
  },
  verificationSchedule: {
    type: String,
    enum: ['5min', 'hourly', 'daily', 'manual'],
    default: 'daily'
  },
  emailNotifications: {
    type: Boolean,
    default: true  // Send email when auto-verification runs
  },
  adminEmail: {
    type: String,
    default: process.env.ADMIN_EMAIL || ''  // Admin email for notifications
  },
  onlyVerifyActive: {
    type: Boolean,
    default: true  // Only verify users with status 'active'
  },
  minPostsRequired: {
    type: Number,
    default: 0  // Minimum posts before verification (0 = no minimum)
  },
  lastAutoVerificationRun: {
    type: Date,
    default: null
  },
  autoVerificationCount: {
    type: Number,
    default: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: String,
    default: 'system'
  }
}, {
  timestamps: true
});

// Calculate days from period string
verificationSettingsSchema.pre('save', function(next) {
  const periodMap = {
    'none': 0,
    '1day': 1,
    '3days': 3,
    '1week': 7,
    '2weeks': 14,
    '1month': 30
  };
  
  this.waitingPeriodDays = periodMap[this.waitingPeriod] || 7;
  this.updatedAt = new Date();
  next();
});

// Singleton pattern - only one settings document
verificationSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('VerificationSettings', verificationSettingsSchema);
