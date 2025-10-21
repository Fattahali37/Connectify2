const User = require("../models/User");
const Post = require("../models/Post");
const Room = require("../models/Room");
const Story = require("../models/Story");
const DeletedUser = require("../models/DeletedUser");
const ProfileFeature = require("../models/ProfileFeature");
const ProfileVerification = require("../models/ProfileVerification");
const axios = require("axios");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .populate("posts")
      .populate("followers")
      .populate("followings")
      .sort({ createdAt: -1 });

    const usersWithStats = users.map((user) => ({
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
      postsCount: user.posts.length,
      followersCount: user.followers.length,
      followingCount: user.followings.length,
    }));

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
      .select("-password")
      .populate("posts")
      .populate("followers")
      .populate("followings")
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
      postsCount: user.posts.length,
      followersCount: user.followers.length,
      followingCount: user.followings.length,
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
    } // Return updated user data with verification status
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
