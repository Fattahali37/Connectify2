const mongoose = require('mongoose');

/**
 * ProfileFeature schema using exact dataset column names.
 */
const profileFeatureSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  'profile pic': { type: Number, enum: [0, 1], default: 0 },
  'nums/length username': { type: Number, default: 0.0 },
  'fullname words': { type: Number, default: 0 },
  'nums/length fullname': { type: Number, default: 0.0 },
  'name==username': { type: Number, enum: [0, 1], default: 0 },
  'description length': { type: Number, default: 0 },
  'external URL': { type: Number, enum: [0, 1], default: 0 },
  'private': { type: Number, enum: [0, 1], default: 0 },
  '#posts': { type: Number, default: 0 },
  '#followers': { type: Number, default: 0 },
    '#following': { type: Number, default: 0 },
  'fake': { type: Number, enum: [0, 1], default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProfileFeature', profileFeatureSchema);
