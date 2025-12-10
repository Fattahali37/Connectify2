const User = require("../models/User");
const Post = require("../models/Post");
const Room = require("../models/Room");
const Story = require("../models/Story");
const DeletedUser = require("../models/DeletedUser");
const ProfileFeature = require("../models/ProfileFeature");
const ProfileVerification = require("../models/ProfileVerification");
const VerificationSettings = require("../models/VerificationSettings");
const axios = require("axios");
const { sendVerificationStartEmail, sendVerificationCompleteEmail } = require("../utils/verificationMailer");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password -requestSent -requestReceived -notifications -highlights -saved")
      .lean()
      .sort({ createdAt: -1 });

    // Get counts in parallel using aggregation
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const [postsCount, followersCount, followingCount] = await Promise.all([
          user.posts?.length || 0,
          user.followers?.length || 0,
          user.followings?.length || 0
        ]);

        return {
          _id: user._id,
          username: user.username,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          website: user.website,
          status: user.status,
          createdAt: user.createdAt,
          lastSeen: user.lastSeen,
          online: user.online,
          private: user.private,
          postsCount,
          followersCount,
          followingCount,
          verificationStatus: user.verificationStatus,
          verificationConfidence: user.verificationConfidence,
          verificationReasoning: user.verificationReasoning,
        };
      })
    );

    res.json({
      success: true,
      users: usersWithStats,
      total: usersWithStats.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

exports.getBlockedUsers = async (req, res) => {
  try {
    const blockedUsers = await User.find({ status: "blocked" })
      .select("-password -requestSent -requestReceived -notifications -highlights -saved")
      .lean()
      .sort({ createdAt: -1 });

    const usersWithStats = blockedUsers.map((user) => ({
      _id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      website: user.website,
      status: user.status,
      createdAt: user.createdAt,
      lastSeen: user.lastSeen,
      online: user.online,
      private: user.private,
      postsCount: user.posts?.length || 0,
      followersCount: user.followers?.length || 0,
      followingCount: user.followings?.length || 0,
    }));

    res.json({
      success: true,
      users: usersWithStats,
      total: usersWithStats.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching blocked users",
      error: error.message,
    });
  }
};

// Delete a user completely
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Store username and email in deleted users collection to prevent reuse
    const deletedUser = new DeletedUser({
      username: user.username,
      email: user.email,
    });
    await deletedUser.save();

    // Delete all user's posts
    await Post.deleteMany({ owner: userId });

    // Delete all rooms where user is a participant
    await Room.deleteMany({ people: userId });

    // Delete all user's stories
    await Story.deleteMany({ owner: userId });

    // Remove user from other users' followers/followings arrays
    await User.updateMany(
      { followers: userId },
      { $pull: { followers: userId } }
    );
    await User.updateMany(
      { followings: userId },
      { $pull: { followings: userId } }
    );

    // Remove user from other users' notifications
    await User.updateMany({}, { $pull: { notifications: { user: userId } } });

    // Remove user from other users' request arrays
    await User.updateMany(
      { requestSent: { user: userId } },
      { $pull: { requestSent: { user: userId } } }
    );
    await User.updateMany(
      { requestReceived: { user: userId } },
      { $pull: { requestReceived: { user: userId } } }
    );

    // Finally delete the user
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};

// Block a user
exports.blockUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndUpdate(
      userId,
      { status: "blocked" },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User blocked successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error blocking user",
      error: error.message,
    });
  }
};

// Unblock a user
exports.unblockUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndUpdate(
      userId,
      { status: "active" },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User unblocked successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error unblocking user",
      error: error.message,
    });
  }
};

// Get user growth statistics
exports.getUserGrowthStats = async (req, res) => {
  try {
    const { period = "month" } = req.query;

    let groupBy, dateFormat;
    switch (period) {
      case "day":
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        };
        dateFormat = "%Y-%m-%d";
        break;
      case "week":
        groupBy = {
          year: { $year: "$createdAt" },
          week: { $week: "$createdAt" },
        };
        dateFormat = "%Y-W%U";
        break;
      default: // month
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        };
        dateFormat = "%Y-%m";
        break;
    }

    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
          date: { $first: "$createdAt" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 } },
    ]);

    const formattedData = userGrowth.map((item) => ({
      date: new Date(
        item._id.year,
        (item._id.month || 1) - 1,
        item._id.day || 1,
        item._id.week || 0
      ),
      count: item.count,
      label: `${item._id.year}-${String(item._id.month || 1).padStart(2, "0")}${
        item._id.day ? `-${String(item._id.day).padStart(2, "0")}` : ""
      }${item._id.week ? `-W${String(item._id.week).padStart(2, "0")}` : ""}`,
    }));

    res.json({
      success: true,
      data: formattedData,
      period,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user growth stats",
      error: error.message,
    });
  }
};

// Get user activity statistics
exports.getUserActivityStats = async (req, res) => {
  try {
    // Active vs Blocked users
    const statusStats = await User.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // User activity levels based on post count
    const activityStats = await User.aggregate([
      {
        $addFields: {
          postsCount: { $size: "$posts" },
        },
      },
      {
        $bucket: {
          groupBy: "$postsCount",
          boundaries: [0, 5, 20, 100],
          default: "high",
          output: {
            count: { $sum: 1 },
            category: {
              $push: {
                $cond: [
                  { $lt: ["$postsCount", 5] },
                  "low",
                  { $cond: [{ $lt: ["$postsCount", 20] }, "medium", "high"] },
                ],
              },
            },
          },
        },
      },
    ]);

    // Online vs Offline users
    const onlineStats = await User.aggregate([
      {
        $group: {
          _id: "$online",
          count: { $sum: 1 },
        },
      },
    ]);

    // Private vs Public accounts
    const privacyStats = await User.aggregate([
      {
        $group: {
          _id: "$private",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        statusDistribution: statusStats,
        activityLevels: activityStats,
        onlineDistribution: onlineStats,
        privacyDistribution: privacyStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user activity stats",
      error: error.message,
    });
  }
};

// Helper function to calculate number ratio in a string
const calculateNumberRatio = (str) => {
  if (!str || str.length === 0) return 0;
  const numbers = str.match(/\d/g);
  return numbers ? numbers.length / str.length : 0;
};

// Helper function to count words
const countWords = (str) => {
  if (!str || str.trim().length === 0) return 0;
  return str.trim().split(/\s+/).length;
};

// Verify profile using ML model

exports.verifyProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("[verifyProfile] Start verification for userId:", userId);

    // Fetch user data for response (not for features)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let profileFeature = await ProfileFeature.findOne({ user: userId });
    console.log(
      "[verifyProfile] profileFeature fetched from MongoDB:",
      !!profileFeature
    );

    // If ProfileFeature doesn't exist, generate it automatically
    if (!profileFeature) {
      console.log(
        "[verifyProfile] ProfileFeature not found, generating from user data..."
      );
      const {
        upsertFeaturesFromUserDoc,
      } = require("../utils/profileFeatureHelper");

      try {
        profileFeature = await upsertFeaturesFromUserDoc(user);
        console.log(
          "[verifyProfile] ProfileFeature generated and saved to MongoDB:",
          !!profileFeature
        );
      } catch (genError) {
        console.error(
          "[verifyProfile] Failed to generate ProfileFeature:",
          genError
        );
        return res.status(500).json({
          success: false,
          message:
            "Profile features not found and failed to generate automatically.",
          error: genError.message,
        });
      }
    }

    // Prepare features object (remove _id, user, createdAt, __v, fake)
    const {
      _id,
      user: pfUser,
      createdAt,
      __v,
      fake,
      ...features
    } = profileFeature.toObject();

    console.log("[verifyProfile] ========================================");
    console.log(
      "[verifyProfile] Features fetched from MongoDB ProfileFeature collection:"
    );
    console.log("[verifyProfile] User ID:", userId);
    console.log("[verifyProfile] Features:", JSON.stringify(features, null, 2));
    console.log("[verifyProfile] ========================================");

    // Validate features shape before calling ML service
    const expectedKeys = [
      "profile pic",
      "nums/length username",
      "fullname words",
      "nums/length fullname",
      "name==username",
      "description length",
      "external URL",
      "private",
      "#posts",
      "#followers",
      "#following",
    ];

    const missingKeys = expectedKeys.filter((k) => !(k in features));
    if (missingKeys.length) {
      console.error(
        "[verifyProfile] Missing ML feature keys for user",
        userId,
        missingKeys
      );
      return res.status(400).json({
        success: false,
        message: "Missing required ML feature keys",
        missing: missingKeys,
      });
    }

    // Coerce values to numbers and guard against NaN
    for (const k of expectedKeys) {
      const v = features[k];
      if (typeof v !== "number") {
        const coerced = Number(v);
        features[k] = Number.isFinite(coerced) ? coerced : 0;
      }
    }
    console.log("[verifyProfile] features after coercion:", features);

    // Call Python Flask API with features from MongoDB
    const FLASK_API_URL = process.env.FLASK_API_URL || "http://127.0.0.1:5000";
    let predictionResponse;
    try {
      console.log("[verifyProfile] ========================================");
      console.log("[verifyProfile] Sending features to Flask ML API");
      console.log("[verifyProfile] API URL:", FLASK_API_URL + "/predict");
      console.log(
        "[verifyProfile] Features from MongoDB Atlas being sent:",
        JSON.stringify(features, null, 2)
      );
      console.log("[verifyProfile] ========================================");

      predictionResponse = await axios.post(
        `${FLASK_API_URL}/predict`,
        features,
        {
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          timeout: 10000,
        }
      );
      console.log(
        "[verifyProfile] ML service response status:",
        predictionResponse.status
      );
      console.log(
        "[verifyProfile] ML service response data:",
        JSON.stringify(predictionResponse.data, null, 2)
      );
    } catch (apiError) {
      console.error("Flask API Error:", apiError.message);
      console.error("Flask API Response:", apiError.response?.data);
      return res.status(503).json({
        success: false,
        message:
          "Failed to connect to ML verification service. Please ensure the Flask API is running at " +
          FLASK_API_URL,
        error: apiError.message,
        details: apiError.response?.data,
      });
    }

    // Validate Flask API response structure
    if (!predictionResponse.data) {
      console.error("[verifyProfile] Flask API returned empty response");
      return res.status(500).json({
        success: false,
        message: "ML service returned invalid response (no data)",
        receivedData: predictionResponse.data,
      });
    }

    const responseData = predictionResponse.data;

    // Validate prediction and confidence fields
    if (
      !responseData.prediction ||
      typeof responseData.prediction.is_fake === "undefined"
    ) {
      console.error(
        "[verifyProfile] Flask API response missing prediction.is_fake:",
        responseData
      );
      return res.status(500).json({
        success: false,
        message:
          "ML service returned invalid response format (missing prediction.is_fake)",
        receivedData: responseData,
      });
    }

    if (
      !responseData.confidence ||
      typeof responseData.confidence.real_profile_prob === "undefined" ||
      typeof responseData.confidence.fake_profile_prob === "undefined"
    ) {
      console.error(
        "[verifyProfile] Flask API response missing confidence data:",
        responseData
      );
      return res.status(500).json({
        success: false,
        message:
          "ML service returned invalid response format (missing confidence data)",
        receivedData: responseData,
      });
    }

    const prediction = responseData.prediction;
    const confidence = responseData.confidence;
    const reasoning = responseData.reasoning || "No reasoning provided";
    const verificationStatus = prediction.is_fake === 1 ? "fake" : "real";

    console.log("[verifyProfile] ========================================");
    console.log("[verifyProfile] ML Prediction Results:");
    console.log("[verifyProfile] Status:", verificationStatus.toUpperCase());
    console.log("[verifyProfile] is_fake:", prediction.is_fake);
    console.log(
      "[verifyProfile] Real Probability:",
      (confidence.real_profile_prob * 100).toFixed(2) + "%"
    );
    console.log(
      "[verifyProfile] Fake Probability:",
      (confidence.fake_profile_prob * 100).toFixed(2) + "%"
    );
    console.log("[verifyProfile] Reasoning:", reasoning);
    console.log("[verifyProfile] ========================================");

    // Check if ProfileVerification already exists
    let profileVerification = await ProfileVerification.findOne({
      userId: userId,
    });

    const verificationHistoryEntry = {
      verifiedAt: new Date(),
      status: verificationStatus,
      confidence: {
        realProfileProb: confidence.real_profile_prob,
        fakeProfileProb: confidence.fake_profile_prob,
      },
      reasoning: reasoning,
    };

    if (profileVerification) {
      // Update existing document
      console.log(
        "[verifyProfile] Updating existing ProfileVerification document"
      );
      profileVerification.features = features;
      profileVerification.verificationStatus = verificationStatus;
      profileVerification.isFake = prediction.is_fake;
      profileVerification.confidence = {
        realProfileProb: confidence.real_profile_prob,
        fakeProfileProb: confidence.fake_profile_prob,
      };
      profileVerification.reasoning = reasoning;
      profileVerification.lastVerified = new Date();
      profileVerification.verificationHistory.push(verificationHistoryEntry);
      await profileVerification.save();
    } else {
      // Create new document
      console.log("[verifyProfile] Creating new ProfileVerification document");
      profileVerification = await ProfileVerification.create({
        userId: userId,
        features: features,
        verificationStatus: verificationStatus,
        isFake: prediction.is_fake,
        confidence: {
          realProfileProb: confidence.real_profile_prob,
          fakeProfileProb: confidence.fake_profile_prob,
        },
        reasoning: reasoning,
        lastVerified: new Date(),
        verificationHistory: [verificationHistoryEntry],
      });
    }
    
    // Update User document with verification status
    await User.findByIdAndUpdate(userId, {
      verificationStatus: verificationStatus,
      verificationConfidence: {
        realProfileProb: confidence.real_profile_prob,
        fakeProfileProb: confidence.fake_profile_prob,
      },
      verificationReasoning: reasoning,
    });

    // Return updated user data with verification status
    res.json({
      success: true,
      message: `Profile verified as ${verificationStatus}`,
      verification: {
        status: verificationStatus,
        isFake: prediction.is_fake,
        confidence: {
          realProfileProb: confidence.real_profile_prob,
          fakeProfileProb: confidence.fake_profile_prob,
        },
        reasoning: reasoning,
        features: features,
        lastVerified: profileVerification.lastVerified,
      },
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        verificationStatus: verificationStatus,
      },
    });
  } catch (error) {
    console.error("[verifyProfile] ========================================");
    console.error("[verifyProfile] ERROR during profile verification");
    console.error("[verifyProfile] User ID:", req.params.userId);
    console.error("[verifyProfile] Error message:", error.message);
    console.error("[verifyProfile] Error stack:", error.stack);
    console.error("[verifyProfile] ========================================");

    const resp = {
      success: false,
      message: "Error verifying profile",
      error: error.message,
    };
    if (process.env.NODE_ENV !== "production") resp.stack = error.stack;
    res.status(500).json(resp);
  }
};

// Get user profile features
exports.getUserProfileFeatures = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch user to ensure they exist
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Fetch profile features
    const profileFeature = await ProfileFeature.findOne({ user: userId });
    if (!profileFeature) {
      return res.status(404).json({
        success: false,
        message: "Profile features not found for this user",
      });
    }

    // Remove internal fields and return features
    const {
      _id,
      user: pfUser,
      createdAt,
      __v,
      ...features
    } = profileFeature.toObject();

    res.json({
      success: true,
      features: features,
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Error fetching profile features:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching profile features",
      error: error.message,
    });
  }
};

// ============================================
// AUTO-VERIFICATION SYSTEM
// ============================================

// Get verification automation settings
exports.getVerificationSettings = async (req, res) => {
  try {
    const settings = await VerificationSettings.getSettings();
    res.json({
      success: true,
      settings: settings
    });
  } catch (error) {
    console.error("Error fetching verification settings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching verification settings",
      error: error.message
    });
  }
};

// Update verification automation settings
exports.updateVerificationSettings = async (req, res) => {
  try {
    const {
      autoVerificationEnabled,
      waitingPeriod,
      verificationSchedule,
      onlyVerifyActive,
      minPostsRequired,
      emailNotifications,
      adminEmail
    } = req.body;

    const settings = await VerificationSettings.getSettings();
    
    if (typeof autoVerificationEnabled !== 'undefined') {
      settings.autoVerificationEnabled = autoVerificationEnabled;
    }
    if (waitingPeriod) {
      settings.waitingPeriod = waitingPeriod;
      // Manually update waitingPeriodDays to ensure it's correct
      const periodMap = {
        'none': 0,
        '1day': 1,
        '3days': 3,
        '1week': 7,
        '2weeks': 14,
        '1month': 30
      };
      settings.waitingPeriodDays = periodMap[waitingPeriod] || 7;
    }
    if (verificationSchedule) {
      settings.verificationSchedule = verificationSchedule;
    }
    if (typeof onlyVerifyActive !== 'undefined') {
      settings.onlyVerifyActive = onlyVerifyActive;
    }
    if (typeof minPostsRequired !== 'undefined') {
      settings.minPostsRequired = minPostsRequired;
    }
    if (typeof emailNotifications !== 'undefined') {
      settings.emailNotifications = emailNotifications;
    }
    if (adminEmail) {
      settings.adminEmail = adminEmail;
    }
    
    settings.updatedBy = req.admin?.username || 'admin';
    await settings.save();

    console.log(`[Auto-Verification] Settings updated:`, {
      enabled: settings.autoVerificationEnabled,
      waitingPeriod: settings.waitingPeriod,
      waitingPeriodDays: settings.waitingPeriodDays,
      schedule: settings.verificationSchedule,
      emailNotifications: settings.emailNotifications,
      adminEmail: settings.adminEmail,
      onlyVerifyActive: settings.onlyVerifyActive,
      minPostsRequired: settings.minPostsRequired
    });

    res.json({
      success: true,
      message: "Verification settings updated successfully",
      settings: settings
    });
  } catch (error) {
    console.error("Error updating verification settings:", error);
    res.status(500).json({
      success: false,
      message: "Error updating verification settings",
      error: error.message
    });
  }
};

// Run auto-verification manually
exports.runAutoVerification = async (req, res) => {
  try {
    const settings = await VerificationSettings.getSettings();
    const { forceAll } = req.body || {}; // Option to verify all users, including already verified
    
    if (!settings.autoVerificationEnabled && !forceAll) {
      return res.status(400).json({
        success: false,
        message: "Auto-verification is disabled. Enable it in settings first."
      });
    }

    console.log("[Auto-Verification] Starting manual verification run...");
    console.log("[Auto-Verification] Force all users:", forceAll || false);
    
    const result = await performAutoVerification(forceAll);
    
    res.json({
      success: true,
      message: "Auto-verification completed",
      result: result
    });
  } catch (error) {
    console.error("Error running auto-verification:", error);
    res.status(500).json({
      success: false,
      message: "Error running auto-verification",
      error: error.message
    });
  }
};

// Core auto-verification logic
async function performAutoVerification(forceAll = false) {
  const settings = await VerificationSettings.getSettings();
  
  console.log("[Auto-Verification] ========================================");
  console.log("[Auto-Verification] Starting automated profile verification");
  console.log("[Auto-Verification] Force All:", forceAll || false);
  console.log("[Auto-Verification] Waiting Period:", settings.waitingPeriod, `(${settings.waitingPeriodDays} days)`);
  console.log("[Auto-Verification] Only Active Users:", settings.onlyVerifyActive);
  console.log("[Auto-Verification] Min Posts Required:", settings.minPostsRequired);
  console.log("[Auto-Verification] ========================================");

  // Reset all verification data before starting new verification
  console.log("[Auto-Verification] Clearing all existing verification data...");
  try {
    const clearResult = await User.updateMany(
      {},
      {
        $unset: {
          verificationStatus: "",
          verificationConfidence: "",
          verificationReasoning: ""
        }
      }
    );
    console.log(`[Auto-Verification] Cleared verification data for ${clearResult.modifiedCount} users`);
  } catch (clearError) {
    console.error("[Auto-Verification] Error clearing verification data:", clearError.message);
  }

  // Send start email notification
  if (settings.emailNotifications && settings.adminEmail) {
    console.log("[Auto-Verification] Sending start email to:", settings.adminEmail);
    try {
      const emailSent = await sendVerificationStartEmail(settings.adminEmail, settings);
      if (emailSent) {
        console.log("[Auto-Verification] Start email sent successfully");
      } else {
        console.log("[Auto-Verification] Start email failed to send");
      }
    } catch (emailError) {
      console.error("[Auto-Verification] Email error:", emailError.message);
    }
  } else {
    console.log("[Auto-Verification] Email notifications disabled or no admin email configured");
    console.log("[Auto-Verification] - emailNotifications:", settings.emailNotifications);
    console.log("[Auto-Verification] - adminEmail:", settings.adminEmail);
  }

  // Calculate cutoff date (users created before this date can be verified)
  const cutoffDate = new Date();
  
  // Build query for eligible users
  const query = {};
  
  // Apply waiting period: EXCLUDE accounts created too recently
  // Only users OLDER than waiting period will be fetched and verified
  if (settings.waitingPeriod !== 'none' && settings.waitingPeriodDays > 0) {
    cutoffDate.setDate(cutoffDate.getDate() - settings.waitingPeriodDays);
    query.createdAt = { $lte: cutoffDate };
    console.log(`[Auto-Verification] Applying waiting period: excluding accounts created after ${cutoffDate.toISOString()}`);
    console.log(`[Auto-Verification] Only verifying accounts ${settings.waitingPeriodDays}+ days old`);
  } else {
    console.log(`[Auto-Verification] No waiting period - verifying all users regardless of age`);
  }

  if (settings.onlyVerifyActive) {
    query.status = 'active';
  }

  console.log("[Auto-Verification] Query:", JSON.stringify(query));

  // Fetch ALL users that meet age requirement (both verified and unverified)
  const usersToVerify = await User.find(query).select('_id username name email createdAt posts status');

  if (settings.waitingPeriod !== 'none' && settings.waitingPeriodDays > 0) {
    console.log(`[Auto-Verification] Found ${usersToVerify.length} users older than ${settings.waitingPeriodDays} days (created before ${cutoffDate.toISOString()})`);
  } else {
    console.log(`[Auto-Verification] Found ${usersToVerify.length} total users`);
  }
  
  if (usersToVerify.length > 0) {
    console.log(`[Auto-Verification] Sample user:`, {
      username: usersToVerify[0].username,
      createdAt: usersToVerify[0].createdAt,
      ageInDays: Math.floor((Date.now() - new Date(usersToVerify[0].createdAt).getTime()) / (24 * 60 * 60 * 1000)),
      status: usersToVerify[0].status,
      posts: usersToVerify[0].posts?.length || 0
    });
  } else {
    console.log(`[Auto-Verification] ⚠️ No users found matching criteria:`);
    if (settings.waitingPeriod !== 'none') {
      console.log(`[Auto-Verification]    - All users are too new (< ${settings.waitingPeriodDays} days old)`);
    } else {
      console.log(`[Auto-Verification]    - No users in database`);
    }
    if (settings.onlyVerifyActive) {
      console.log(`[Auto-Verification]    - Status filter: only 'active' users`);
    }
  }

  // Apply remaining filters (posts requirement only)
  // NOTE: We verify ALL users past waiting period, including already-verified ones
  const eligibleUsers = [];
  let skippedCount = { notEnoughPosts: 0 };
  
  for (const user of usersToVerify) {
    // Check minimum posts requirement
    if (settings.minPostsRequired > 0 && user.posts.length < settings.minPostsRequired) {
      console.log(`[Auto-Verification] Skipping ${user.username} - only ${user.posts.length} posts (min: ${settings.minPostsRequired})`);
      skippedCount.notEnoughPosts++;
      continue;
    }

    eligibleUsers.push(user);
  }

  console.log(`[Auto-Verification] ========================================`);
  console.log(`[Auto-Verification] Filtering Results:`);
  console.log(`[Auto-Verification] - Total users found (past waiting period): ${usersToVerify.length}`);
  console.log(`[Auto-Verification] - Not enough posts: ${skippedCount.notEnoughPosts}`);
  console.log(`[Auto-Verification] - Eligible for (re)verification: ${eligibleUsers.length}`);
  console.log(`[Auto-Verification] ========================================`);

  const results = {
    total: eligibleUsers.length,
    verified: 0,
    failed: 0,
    skipped: 0,
    real: 0,
    fake: 0,
    errors: []
  };

  if (eligibleUsers.length === 0) {
    console.log(`[Auto-Verification] No users eligible for verification.`);
    console.log(`[Auto-Verification] This could mean:`);
    console.log(`[Auto-Verification]   - All users are too new (under waiting period)`);
    console.log(`[Auto-Verification]   - Users don't meet minimum posts requirement`);
    console.log(`[Auto-Verification]   - No users in database`);
  }

  // Verify each eligible user (including re-verification of already verified users)
  for (const user of eligibleUsers) {
    try {
      // Check if user was previously verified
      const existingVerification = await ProfileVerification.findOne({ userId: user._id });
      const isReVerification = !!existingVerification;
      
      if (isReVerification) {
        console.log(`[Auto-Verification] RE-VERIFYING user: ${user.username} (previously: ${existingVerification.verificationStatus})`);
      } else {
        console.log(`[Auto-Verification] NEW VERIFICATION for user: ${user.username}`);
      }
      
      // Get or generate profile features
      let profileFeature = await ProfileFeature.findOne({ user: user._id });
      
      if (!profileFeature) {
        const { upsertFeaturesFromUserDoc } = require("../utils/profileFeatureHelper");
        try {
          profileFeature = await upsertFeaturesFromUserDoc(user);
        } catch (genError) {
          console.error(`[Auto-Verification] Failed to generate features for ${user.username}:`, genError.message);
          results.failed++;
          results.errors.push({ username: user.username, error: "Feature generation failed" });
          continue;
        }
      }

      // Prepare features
      const { _id, user: pfUser, createdAt, __v, fake, ...features } = profileFeature.toObject();

      // Validate and coerce features (same as verifyProfile)
      const expectedKeys = [
        "profile pic",
        "nums/length username",
        "fullname words",
        "nums/length fullname",
        "name==username",
        "description length",
        "external URL",
        "private",
        "#posts",
        "#followers",
        "#following",
      ];

      const missingKeys = expectedKeys.filter((k) => !(k in features));
      if (missingKeys.length) {
        console.error(`[Auto-Verification] Missing features for ${user.username}:`, missingKeys);
        results.failed++;
        results.errors.push({ username: user.username, error: "Missing ML features" });
        continue;
      }

      // Coerce values to numbers and guard against NaN
      for (const k of expectedKeys) {
        const v = features[k];
        if (typeof v !== "number") {
          const coerced = Number(v);
          features[k] = Number.isFinite(coerced) ? coerced : 0;
        }
      }

      // Call Flask API
      const FLASK_API_URL = process.env.FLASK_API_URL || "http://127.0.0.1:5000";
      console.log(`[Auto-Verification] Calling Flask ML API for ${user.username} at ${FLASK_API_URL}/predict`);
      let predictionResponse;
      
      try {
        predictionResponse = await axios.post(`${FLASK_API_URL}/predict`, features, {
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          timeout: 15000
        });
        console.log(`[Auto-Verification] Flask API responded for ${user.username}`);
      } catch (apiError) {
        console.error(`[Auto-Verification] Flask API error for ${user.username}:`, apiError.message);
        results.failed++;
        results.errors.push({ username: user.username, error: "ML API failed" });
        continue;
      }

      const responseData = predictionResponse.data;
      
      // Validate prediction and confidence fields (same as verifyProfile)
      if (
        !responseData.prediction ||
        typeof responseData.prediction.is_fake === "undefined"
      ) {
        console.error(`[Auto-Verification] Invalid prediction for ${user.username}:`, responseData);
        results.failed++;
        results.errors.push({ username: user.username, error: "Invalid ML prediction format" });
        continue;
      }

      if (
        !responseData.confidence ||
        typeof responseData.confidence.real_profile_prob === "undefined" ||
        typeof responseData.confidence.fake_profile_prob === "undefined"
      ) {
        console.error(`[Auto-Verification] Invalid confidence for ${user.username}:`, responseData);
        results.failed++;
        results.errors.push({ username: user.username, error: "Invalid ML confidence format" });
        continue;
      }

      const prediction = responseData.prediction;
      const confidence = responseData.confidence;
      const reasoning = responseData.reasoning || "Auto-verified by system";
      const verificationStatus = prediction.is_fake === 1 ? "fake" : "real";

      console.log(`[Auto-Verification] ${user.username}: ${verificationStatus.toUpperCase()} (${(prediction.is_fake === 1 ? confidence.fake_profile_prob : confidence.real_profile_prob) * 100}% confidence)`);

      // Update or create verification record (existingVerification already fetched at loop start)
      if (existingVerification) {
        // Update existing verification
        console.log(`[Auto-Verification] Updating existing verification record (was: ${existingVerification.verificationStatus}, now: ${verificationStatus})`);
        existingVerification.features = features;
        existingVerification.verificationStatus = verificationStatus;
        existingVerification.isFake = prediction.is_fake;
        existingVerification.confidence = {
          realProfileProb: confidence.real_profile_prob,
          fakeProfileProb: confidence.fake_profile_prob,
        };
        existingVerification.reasoning = reasoning;
        existingVerification.lastVerified = new Date();
        existingVerification.verificationHistory.push({
          verifiedAt: new Date(),
          status: verificationStatus,
          confidence: {
            realProfileProb: confidence.real_profile_prob,
            fakeProfileProb: confidence.fake_profile_prob,
          },
          reasoning: reasoning
        });
        await existingVerification.save();
      } else {
        // Create new verification
        console.log(`[Auto-Verification] Creating new verification record`);
        await ProfileVerification.create({
          userId: user._id,
          features: features,
          verificationStatus: verificationStatus,
          isFake: prediction.is_fake,
          confidence: {
            realProfileProb: confidence.real_profile_prob,
            fakeProfileProb: confidence.fake_profile_prob,
          },
          reasoning: reasoning,
          lastVerified: new Date(),
          verificationHistory: [{
            verifiedAt: new Date(),
            status: verificationStatus,
            confidence: {
              realProfileProb: confidence.real_profile_prob,
              fakeProfileProb: confidence.fake_profile_prob,
            },
            reasoning: reasoning
          }]
        });
      }

      // Update User document with verification status
      await User.findByIdAndUpdate(user._id, {
        verificationStatus: verificationStatus,
        verificationConfidence: {
          realProfileProb: confidence.real_profile_prob,
          fakeProfileProb: confidence.fake_profile_prob,
        },
        verificationReasoning: reasoning,
      });

      results.verified++;
      if (verificationStatus === 'real') {
        results.real++;
      } else {
        results.fake++;
      }

      console.log(`[Auto-Verification] ${user.username} verified as ${verificationStatus.toUpperCase()}`);

    } catch (error) {
      console.error(`[Auto-Verification] Error verifying ${user.username}:`, error.message);
      results.failed++;
      results.errors.push({ username: user.username, error: error.message });
    }
  }

  // Update settings with last run time
  settings.lastAutoVerificationRun = new Date();
  settings.autoVerificationCount += results.verified;
  await settings.save();

  console.log("[Auto-Verification] ========================================");
  console.log("[Auto-Verification] Verification Complete!");
  console.log("[Auto-Verification] Results:", results);
  console.log("[Auto-Verification] ========================================");

  // Send completion email notification
  if (settings.emailNotifications && settings.adminEmail) {
    console.log("[Auto-Verification] Sending completion email to:", settings.adminEmail);
    try {
      const emailSent = await sendVerificationCompleteEmail(settings.adminEmail, results, settings);
      if (emailSent) {
        console.log("[Auto-Verification] Completion email sent successfully");
      } else {
        console.log("[Auto-Verification] Completion email failed to send");
      }
    } catch (emailError) {
      console.error("[Auto-Verification] Email error:", emailError.message);
    }
  } else {
    console.log("[Auto-Verification] Email notifications disabled or no admin email configured");
  }

  return results;
}

// Export the auto-verification function for cron jobs
exports.performAutoVerification = performAutoVerification;

