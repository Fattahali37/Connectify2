const mongoose = require("mongoose");

const profileVerificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  // ML Model Features (exactly matching Python API requirements)
  features: {
    "profile pic": {
      type: Number,
      required: true,
      // 1 if user has profile picture, 0 if not
    },
    "nums/length username": {
      type: Number,
      required: true,
      // Ratio of numbers to total length of username
    },
    "fullname words": {
      type: Number,
      required: true,
      // Number of words in full name
    },
    "nums/length fullname": {
      type: Number,
      required: true,
      // Ratio of numbers to total length of full name
    },
    "name==username": {
      type: Number,
      required: true,
      // 1 if name equals username, 0 if not
    },
    "description length": {
      type: Number,
      required: true,
      // Length of bio/description
    },
    "external URL": {
      type: Number,
      required: true,
      // 1 if user has external URL/website, 0 if not
    },
    private: {
      type: Number,
      required: true,
      // 1 if account is private, 0 if public
    },
    "#posts": {
      type: Number,
      required: true,
      // Number of posts
    },
    "#followers": {
      type: Number,
      required: true,
      // Number of followers
    },
    "#following": {
      type: Number,
      required: true,
      // Number of followings
    },
  },
  // Verification Results
  verificationStatus: {
    type: String,
    enum: ["real", "fake", "pending", "error"],
    default: "pending",
  },
  isFake: {
    type: Number,
    // 0 for real, 1 for fake (from ML model)
  },
  confidence: {
    realProfileProb: {
      type: Number,
      min: 0,
      max: 1,
    },
    fakeProfileProb: {
      type: Number,
      min: 0,
      max: 1,
    },
  },
  lastVerified: {
    type: Date,
    default: Date.now,
  },
  verificationHistory: [
    {
      verifiedAt: {
        type: Date,
        default: Date.now,
      },
      status: String,
      confidence: {
        realProfileProb: Number,
        fakeProfileProb: Number,
      },
    },
  ],
});

// Index for faster queries
profileVerificationSchema.index({ userId: 1 });
profileVerificationSchema.index({ verificationStatus: 1 });

module.exports = mongoose.model("ProfileVerification", profileVerificationSchema);
