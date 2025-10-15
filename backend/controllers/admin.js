const User = require("../models/User");
const Post = require("../models/Post");
const Room = require("../models/Room");
const Story = require("../models/Story");
const DeletedUser = require("../models/DeletedUser");

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .populate('posts')
      .populate('followers')
      .populate('followings')
      .sort({ createdAt: -1 });

    const usersWithStats = users.map(user => ({
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
      total: usersWithStats.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message
    });
  }
};

// Get blocked users only
exports.getBlockedUsers = async (req, res) => {
  try {
    const blockedUsers = await User.find({ status: 'blocked' })
      .select('-password')
      .populate('posts')
      .populate('followers')
      .populate('followings')
      .sort({ createdAt: -1 });

    const usersWithStats = blockedUsers.map(user => ({
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
      total: usersWithStats.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching blocked users",
      error: error.message
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
        message: "User not found"
      });
    }

    // Store username and email in deleted users collection to prevent reuse
    const deletedUser = new DeletedUser({
      username: user.username,
      email: user.email
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
    await User.updateMany(
      {},
      { $pull: { notifications: { user: userId } } }
    );

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
      message: "User deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message
    });
  }
};

// Block a user
exports.blockUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndUpdate(
      userId,
      { status: 'blocked' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "User blocked successfully",
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error blocking user",
      error: error.message
    });
  }
};

// Unblock a user
exports.unblockUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndUpdate(
      userId,
      { status: 'active' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "User unblocked successfully",
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error unblocking user",
      error: error.message
    });
  }
};

// Get user growth statistics
exports.getUserGrowthStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let groupBy, dateFormat;
    switch (period) {
      case 'day':
        groupBy = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } };
        dateFormat = "%Y-%m-%d";
        break;
      case 'week':
        groupBy = { year: { $year: "$createdAt" }, week: { $week: "$createdAt" } };
        dateFormat = "%Y-W%U";
        break;
      default: // month
        groupBy = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } };
        dateFormat = "%Y-%m";
        break;
    }

    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
          date: { $first: "$createdAt" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 } }
    ]);

    const formattedData = userGrowth.map(item => ({
      date: new Date(item._id.year, (item._id.month || 1) - 1, item._id.day || 1, item._id.week || 0),
      count: item.count,
      label: `${item._id.year}-${String(item._id.month || 1).padStart(2, '0')}${item._id.day ? `-${String(item._id.day).padStart(2, '0')}` : ''}${item._id.week ? `-W${String(item._id.week).padStart(2, '0')}` : ''}`
    }));

    res.json({
      success: true,
      data: formattedData,
      period
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user growth stats",
      error: error.message
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
          count: { $sum: 1 }
        }
      }
    ]);

    // User activity levels based on post count
    const activityStats = await User.aggregate([
      {
        $addFields: {
          postsCount: { $size: "$posts" }
        }
      },
      {
        $bucket: {
          groupBy: "$postsCount",
          boundaries: [0, 5, 20, 100],
          default: "high",
          output: {
            count: { $sum: 1 },
            category: { $push: { $cond: [{ $lt: ["$postsCount", 5] }, "low", { $cond: [{ $lt: ["$postsCount", 20] }, "medium", "high"] }] } }
          }
        }
      }
    ]);

    // Online vs Offline users
    const onlineStats = await User.aggregate([
      {
        $group: {
          _id: "$online",
          count: { $sum: 1 }
        }
      }
    ]);

    // Private vs Public accounts
    const privacyStats = await User.aggregate([
      {
        $group: {
          _id: "$private",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        statusDistribution: statusStats,
        activityLevels: activityStats,
        onlineDistribution: onlineStats,
        privacyDistribution: privacyStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user activity stats",
      error: error.message
    });
  }
};
