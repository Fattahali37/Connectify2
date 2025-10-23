const User = require("../models/User");
const bcrypt = require("bcrypt");
const { SendMail } = require("../utils/mail");
const { v4: uid } = require("uuid");
const ResetTokens = require("../models/ResetTokens");
const { computeFeaturesForUserId } = require('../utils/profileFeatureHelper');

// get a user by username
exports.getUser = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      return res.send({
        success: false,
        message: "No user found",
      });
    }
    res.send(user);
  } catch (err) {
    res.send({
      success: false,
      message: err.message,
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.send({
        success: false,
        message: "No user found",
      });
    }
    res.send(user);
  } catch (err) {
    res.send({
      success: false,
      message: err.message,
    });
  }
};

// follow/Unfollow user
exports.followHandle = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = req.user._id;
    const userdb = await User.findOne({ _id: user });
    const targetUser = await User.findOne({ _id: userId });

    if (!targetUser) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // Check if already following - if so, unfollow
    if (userdb.followings.includes(userId)) {
      await User.updateOne({ _id: user }, { $pull: { followings: userId } });
      await User.updateOne({ _id: userId }, { $pull: { followers: user } });
      // Also remove from request arrays if present
      await User.updateOne(
        { _id: user },
        { $pull: { requestSent: { user: userId } } }
      );
      await User.updateOne(
        { _id: userId },
        { $pull: { requestReceived: { user: user } } }
      );
      // update profile features for both users (counts changed)
      computeFeaturesForUserId(user);
      computeFeaturesForUserId(userId);
      return res.send({
        success: true,
        message: "unfollowed",
        action: "unfollowed",
      });
    }

    // Check if request already sent
    const alreadyRequested = userdb.requestSent.some(
      (req) => req.user.toString() === userId
    );
    if (alreadyRequested) {
      // Cancel the request
      await User.updateOne(
        { _id: user },
        { $pull: { requestSent: { user: userId } } }
      );
      await User.updateOne(
        { _id: userId },
        { $pull: { requestReceived: { user: user } } }
      );
      return res.send({
        success: true,
        message: "request_cancelled",
        action: "request_cancelled",
      });
    }

    // If target user has private account, send follow request
    if (targetUser.private) {
      await User.updateOne(
        { _id: user },
        { $push: { requestSent: { user: userId } } }
      );
      await User.updateOne(
        { _id: userId },
        {
          $push: {
            requestReceived: { user: user },
            notifications: {
              user: user,
              content: "requested to follow you",
              NotificationType: 4, // 4 = follow request
            },
          },
        }
      );
      return res.send({
        success: true,
        message: "request_sent",
        action: "requested",
      });
    }

    // If public account, follow directly
    await User.updateOne({ _id: user }, { $push: { followings: userId } });
    await User.updateOne({ _id: userId }, { $push: { followers: user } });
    await User.updateOne(
      { _id: userId },
      {
        $push: {
          notifications: {
            user: user,
            content: "Followed you",
            NotificationType: 3,
          },
        },
      }
    );
    // update profile features for both users (counts changed)
    computeFeaturesForUserId(user);
    computeFeaturesForUserId(userId);
    return res.send({
      success: true,
      message: "followed",
      action: "followed",
    });
  } catch (err) {
    res.send({
      success: false,
      message: err.message,
    });
  }
};

// get followings list og a user
exports.getFollowings = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const currentUser = req.user._id;
    const user = await User.findOne({ _id: userId });
    
    // If account is private and current user is not a follower, return empty
    if (user.private && !user.followers.includes(currentUser.toString())) {
      return res.send([]);
    }
    
    let followings = [];
    Promise.all(
      user.followings.map(async (item) => {
        followings.push(await User.findOne({ _id: item.toString() }));
      })
    ).then(() => {
      res.send(followings);
    });
  } catch (err) {
    res.send({
      success: false,
      message: err.message,
    });
  }
};

// get followers list og a user
exports.getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user._id;
    const user = await User.findOne({ _id: userId });
    
    // If account is private and current user is not a follower, return empty
    if (user.private && !user.followers.includes(currentUser.toString())) {
      return res.send([]);
    }
    
    let followers = [];
    Promise.all(
      user.followers.map(async (item) => {
        followers.push(await User.findOne({ _id: item.toString() }));
      })
    ).then(() => {
      res.send(followers);
    });
  } catch (err) {
    res.send({
      success: false,
      message: err.message,
    });
  }
};

// check user has unreadnotifications
exports.hasNotications = async (req, res) => {
  try {
    const user = req.user._id;
    const notificationsUser = await User.findOne(
      { _id: user },
      { notifications: { $elemMatch: { seen: false } } }
    );
    res.send({ notifications: notificationsUser.notifications !== undefined });
  } catch (err) {
    res.send({
      success: false,
      message: err.message,
    });
  }
};

// get all notifications of user
exports.notications = async (req, res) => {
  try {
    const user = req.user._id;
    const notifications = await User.findOne({ _id: user });
    const unSorted = notifications.notifications;
    res.send(unSorted.reverse());
  } catch (err) {
    console.log(err);
    res.send({
      success: false,
      message: err.message,
    });
  }
};

// update user
exports.updateUser = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('[updateUser] Incoming payload:', req.body);
    // Update user with new data
    const updateResult = await User.updateOne(
      { _id: userId },
      { $set: req.body }
    );
    console.log('[updateUser] DB update result:', updateResult);
    // Fetch latest user and update profile features
    try {
      const UserModel = require('../models/User');
      const latestUser = await UserModel.findOne({ _id: userId });
      console.log('[updateUser] Latest user after update:', latestUser);
      const { upsertFeaturesFromUserDoc } = require('../utils/profileFeatureHelper');
      await upsertFeaturesFromUserDoc(latestUser);
      // return the updated user so frontend can update state
      return res.send({ success: true, user: latestUser });
    } catch (e) {
      console.error('failed to schedule profile feature update', e.message || e);
      // still attempt to return the latest user if available
      const latestUser = await User.findOne({ _id: userId });
      return res.send({ success: true, user: latestUser });
    }
  } catch (err) {
    console.error('[updateUser] Error:', err);
    res.send({
      success: false,
      message: err.message,
    });
  }
};

// search user
exports.search = async (req, res) => {
  try {
    const user = req.user._id;
    const { text } = req.params;
    const result = await User.find({
      username: { $regex: text, $options: "i" },
    });
    res.send(result.filter((item) => item._id.toString() !== user));
  } catch (err) {
    res.send({
      success: false,
      message: err.message,
    });
  }
};

// suggestions
exports.suggestions = async (req, res) => {
  try {
    const notFollowed = await User.find({
      $and: [
        { followers: { $ne: req.user._id } },
        { _id: { $ne: req.user._id } },
      ],
    }).limit(parseInt(req.query.limit ?? 5));
    res.send(notFollowed);
  } catch (err) {
    res.status(400).send({
      success: false,
      message: err.message,
    });
  }
};

//change password
exports.changePassword = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id }).select("+password");
    const isCorrect = await bcrypt.compare(req.body.password, user.password);
    if (!isCorrect)
      return res.status(400).send({
        message: "Current password is wrong",
      });
    if (req.body.newPassword !== req.body.confirmPassword)
      return res.status(400).send({
        message: "Confirm password and new password doesnt match",
      });
    const updated = await User.updateOne(
      { _id: req.user._id },
      { $set: { password: bcrypt.hashSync(req.body.newPassword, 10) } }
    );
    res.send({
      success: true,
      message: "Updated password",
    });
  } catch (err) {
    res.status(400).send({
      success: false,
      message: err.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: `${req.user._id}` } });
    res.send(users);
  } catch (err) {
    res.status(400).send({
      success: false,
      message: err.message,
    });
  }
};

// forgot password
exports.resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      $or: [{ email: req.body.text }, { username: req.body.text }],
    });
    if (!user)
      return res.status(400).json({ success: false, message: "No user found" });
    const token = uid();
    const prevToken = await ResetTokens.findOne({ email: user.email });
    if (prevToken) {
      await ResetTokens.updateOne(
        { email: user.email },
        { $set: { token: token } }
      );
    } else {
      const newTokenSave = new ResetTokens({
        token,
        email: user.email,
      });
      await newTokenSave.save();
    }
    await SendMail(`${process.env.CLIENT_URL}/reset/${token}`, user.email);
    res.json({ success: true, message: "Reset link sent to email" });
  } catch (err) {
    res.status(400).send({
      success: false,
      message: err.message,
    });
  }
};

exports.checkResetToken = async (req, res) => {
  try {
    const tokenDoc = await ResetTokens.findOne({ token: req.params.token });
    if (!tokenDoc)
      return res.status(400).json({ success: false, message: "Invalid Link" });
    const now = Date.now();
    const createdAt = Date.parse(tokenDoc.updatedAt);
    const oneDay = 24 * 60 * 60 * 1000;
    const isMoreThanADay = now - createdAt > oneDay;
    if (isMoreThanADay)
      return res.status(400).json({ success: false, message: "Link Expired" });
    res.json({ success: true });
  } catch (err) {
    res.status(400).send({
      success: false,
      message: err.message,
    });
  }
};

exports.handleNewPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const tokenDoc = await ResetTokens.findOne({ token });
    if (!tokenDoc)
      return res
        .status(400)
        .json({ success: false, message: "Something went wrong" });
    User.updateOne(
      { email: tokenDoc.email },
      { $set: { password: bcrypt.hashSync(password, 10) } }
    )
      .then(() => {
        return ResetTokens.deleteOne({ token });
      })
      .then(() => {
        res.json({ success: true });
      });
  } catch (err) {
    res.status(400).send({
      success: false,
      message: err.message,
    });
  }
};

// read unread notifications to read

// get unread notification count
exports.getUnreadNotificationCount = async (req, res) => {
  try {
    const user = req.user._id;
    const userData = await User.findOne({ _id: user });

    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Count notifications where seen is false
    const unreadCount = userData.notifications.filter(
      (notification) => !notification.seen
    ).length;

    res.json({ success: true, count: unreadCount });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// mark notifications as read
exports.markNotificationsAsRead = async (req, res) => {
  try {
    const user = req.user._id;

    // Update all notifications to seen: true
    await User.updateOne(
      { _id: user },
      { $set: { "notifications.$[].seen": true } }
    );

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Get follow requests
exports.getFollowRequests = async (req, res) => {
  try {
    console.log("🔍 GET /follow-requests endpoint HIT!");
    console.log("🔍 req.user:", req.user);
    console.log("🔍 req.user._id:", req.user._id);
    console.log("🔍 Type of req.user._id:", typeof req.user._id);
    
    const user = await User.findOne({ _id: req.user._id });
    
    console.log("🔍 Database query result:", user ? "User FOUND" : "User NOT FOUND");
    
    if (!user) {
      console.log("❌ User not found in database for ID:", req.user._id);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("📊 User found:", user.username);
    console.log("📊 RequestReceived count:", user.requestReceived?.length || 0);

    // Check if user has any requests
    if (!user.requestReceived || user.requestReceived.length === 0) {
      console.log("✅ No pending requests");
      return res.json({
        success: true,
        requests: [],
      });
    }

    // Get all user IDs from requestReceived
    const requestUserIds = user.requestReceived.map((req) => req.user);
    console.log("🆔 Extracting user IDs:", requestUserIds.length);

    // Fetch user details using populate-like approach
    const requests = [];
    
    for (const reqItem of user.requestReceived) {
      try {
        const reqUser = await User.findById(reqItem.user).select('username name avatar');
        if (reqUser) {
          requests.push({
            user: {
              _id: reqUser._id,
              username: reqUser.username,
              name: reqUser.name,
              avatar: reqUser.avatar,
            },
          });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }

    console.log("✅ Successfully fetched", requests.length, "requests");

    return res.json({
      success: true,
      requests,
    });
  } catch (err) {
    console.error("❌ Error in getFollowRequests:", err);
    console.error("❌ Error stack:", err.stack);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch follow requests",
    });
  }
};

// Accept follow request
exports.acceptFollowRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user._id;

    // Add to followers/following
    await User.updateOne(
      { _id: currentUser },
      {
        $push: { followers: userId },
        $pull: { requestReceived: { user: userId } },
      }
    );
    await User.updateOne(
      { _id: userId },
      {
        $push: { followings: currentUser },
        $pull: { requestSent: { user: currentUser } },
      }
    );

    // Send notification
    await User.updateOne(
      { _id: userId },
      {
        $push: {
          notifications: {
            user: currentUser,
            content: "accepted your follow request",
            NotificationType: 5, // 5 = request accepted
          },
        },
      }
    );

    // Update profile features
    computeFeaturesForUserId(currentUser);
    computeFeaturesForUserId(userId);

    res.json({
      success: true,
      message: "Follow request accepted",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Reject follow request
exports.rejectFollowRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user._id;

    // Remove from request arrays
    await User.updateOne(
      { _id: currentUser },
      { $pull: { requestReceived: { user: userId } } }
    );
    await User.updateOne(
      { _id: userId },
      { $pull: { requestSent: { user: currentUser } } }
    );

    res.json({
      success: true,
      message: "Follow request rejected",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Get follow request count
exports.getFollowRequestCount = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id });
    const count = user.requestReceived ? user.requestReceived.length : 0;

    res.json({
      success: true,
      count,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
