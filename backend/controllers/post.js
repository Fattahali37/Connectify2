const Post = require("../models/Post");
const User = require("../models/User");
const { computeFeaturesForUserId } = require('../utils/profileFeatureHelper');

exports.getPost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.postId });
    if (!post)
      return res.send({
        success: false,
        message: "Post doesn't exist",
      });
    res.send(post);
  } catch (err) {
    res.send({
      success: false,
      message: err.message,
    });
  }
};

exports.createPost = async (req, res) => {
  try {
    const post = new Post({ ...req.body, owner: req.user._id });
    const saved = await post.save();
    await User.updateOne(
      { _id: req.user._id },
      { $push: { posts: saved._id } }
    );
    // update posts_count in profile features
    computeFeaturesForUserId(req.user._id);
    res.send(saved);
  } catch (err) {
    res.send({
      success: false,
      message: err.message,
    });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.postId });
    if (post.owner.toString() !== req.user._id.toString())
      return res.status(401).send({
        success: false,
        message: "forbidden",
      });
    await Post.deleteOne({ _id: req.params.postId });
    await User.updateOne(
      { _id: req.user._id },
      { $pull: { posts: req.params.postId } }
    );
    // update posts_count in profile features
    computeFeaturesForUserId(req.user._id);
    res.status(200).send({
      success: true,
      message: "done",
    });
  } catch (err) {
    res.send({
      success: false,
      message: err.message,
    });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { caption } = req.body;
    if (!caption)
      return res.send({
        success: false,
        message: "Caption required",
      });
    const edited = await Post.updateOne(
      { _id: req.params.postId },
      { caption }
    );
    res.send({
      success: true,
      edited,
    });
  } catch (err) {
    res.send({
      success: false,
      message: err.message,
    });
  }
};

exports.likesHandle = async (req, res) => {
  try {
    const user = req.user._id;
    const post = await Post.findOne({ _id: req.params.postId });
    if (!post)
      return res.send({
        success: false,
        message: "Post doesn't exist",
      });
    const likesArr = post.likes;
    if (likesArr.includes(user)) {
      const change = await Post.updateOne(
        { _id: req.params.postId },
        { $pull: { likes: user } }
      );
      return res.send(change);
    } else {
      const change = await Post.updateOne(
        { _id: req.params.postId },
        { $push: { likes: user } }
      );
      if (post.owner != user) {
        await User.updateOne(
          { _id: post.owner.toString() },
          {
            $push: {
              notifications: {
                user: user,
                content: "Liked your post",
                NotificationType: 1,
                postId: req.params.postId,
              },
            },
          }
        );
      }
      return res.send(change);
    }
  } catch (err) {
    res.send({
      success: false,
      message: err.message,
    });
  }
};

exports.addComment = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.postId });
    if (!req.body.comment)
      return res.status(500).send({
        success: false,
        message: "Cant make an empty comment",
      });
    if (!post)
      return res.status(400).send({
        success: false,
        message: "Post doesn't exist",
      });
    const comment = await Post.updateOne(
      { _id: req.params.postId },
      { $push: { comments: { user: req.user._id, comment: req.body.comment } } }
    );
    if (post.owner != req.user._id)
      await User.updateOne(
        { _id: post.owner.toString() },
        {
          $push: {
            notifications: {
              user: req.user._id,
              content: `commented : ${req.body.comment} `,
              NotificationType: 2,
              postId: req.params.postId,
            },
          },
        }
      );
    res.send(comment);
  } catch (err) {
    res.send({
      success: false,
      message: err.message,
    });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const comment = await Post.updateOne(
      { _id: req.params.postId, "comments._id": req.query.commentId },
      { $set: { "comments.$.comment": req.body.comment } }
    );
    res.send(comment);
  } catch (err) {
    res.send({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.postId });
    const commentId = req.query.commentId;
    if (!post)
      return res.status(400).send({
        success: false,
        message: "Post doesn't exist",
      });
    const deleted = await Post.updateOne(
      { _id: req.params.postId },
      { $pull: { comments: { _id: commentId } } }
    );
    res.send(deleted);
  } catch (err) {
    res.send({
      success: false,
      message: err.message,
    });
  }
};

exports.save = async (req, res) => {
  try {
    const userFind = await User.findOne({ _id: req.user._id });
    const savedArr = userFind.saved;
    if (savedArr.includes(req.params.postId)) {
      await User.updateOne(
        { _id: req.user._id },
        { $pull: { saved: req.params.postId } }
      );
      await Post.updateOne(
        { _id: req.params.postId },
        { $pull: { saved: req.user._id } }
      );
      res.send({
        success: true,
      });
    } else {
      await User.updateOne(
        { _id: req.user._id },
        { $push: { saved: req.params.postId } }
      );
      await Post.updateOne(
        { _id: req.params.postId },
        { $push: { saved: req.user._id } }
      );
      res.send({
        success: true,
      });
    }
  } catch (err) {
    res.send({
      success: false,
      message: err.message,
    });
  }
};

// users post
exports.userPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user posts with only needed fields - limit to 100 most recent
    const posts = await Post.find({ owner: userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .select('owner files caption likes comments saved createdAt')
      .lean();
    
    res.send(posts);
  } catch (err) {
    res.send({
      success: false,
      message: err.message,
    });
  }
};

// explore post
exports.explore = async (req, res) => {
  try {
    // Optimized: Get user with only needed fields
    const currentUser = await User.findOne({ _id: req.user._id })
      .select('followings')
      .lean();
    
    // Get all public user IDs
    const publicUsers = await User.find({ 
      private: { $ne: true },
      _id: { $ne: req.user._id }
    })
    .select('_id')
    .lean();
    
    // Get IDs of users whose posts should be shown:
    // 1. Public users, OR
    // 2. Private users that current user is following
    const visibleUserIds = [
      ...publicUsers.map(u => u._id),
      ...(currentUser.followings || [])
    ];
    
    // Single optimized query - limit to 150 most recent posts
    const posts = await Post.find({ 
      owner: { $in: visibleUserIds, $ne: req.user._id } 
    })
    .sort({ createdAt: -1 })
    .limit(150)
    .select('owner files caption likes comments saved createdAt')
    .lean();
    
    res.send(posts);
  } catch (err) {
    res.send({
      success: false,
      message: err.message,
    });
  }
};

// saved posts
exports.savedPosts = async (req, res) => {
  try {
    // Optimized: Get only saved field
    const findUser = await User.findOne({ _id: req.user._id })
      .select('saved')
      .lean();
    
    // Single query with $in operator - limit to 100 most recent
    const savedPosts = await Post.find({ 
      _id: { $in: findUser.saved || [] } 
    })
    .sort({ createdAt: -1 })
    .limit(100)
    .select('owner files caption likes comments saved createdAt')
    .lean();
    
    res.send(savedPosts);
  } catch (err) {
    res.send({
      success: false,
      message: err.message,
    });
  }
};

// followings + my posts (home)
exports.homePosts = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Optimized: Get user with only needed fields
    const user = await User.findOne({ _id: userId })
      .select('followings')
      .lean();
    
    // Get IDs of users whose posts we want to show
    const userIdsToShow = [userId, ...(user.followings || [])];
    
    // Get all public users NOT in our following list
    const publicUserIds = await User.find({ 
      private: { $ne: true },
      _id: { $nin: userIdsToShow }
    })
    .select('_id')
    .lean();
    
    // Add public user IDs to the list
    const allUserIds = [...userIdsToShow, ...publicUserIds.map(u => u._id)];
    
    // Single optimized query - limit to recent 100 posts for better performance
    const posts = await Post.find({ 
      owner: { $in: allUserIds } 
    })
    .sort({ createdAt: -1 })
    .limit(100)
    .select('owner files caption likes comments saved createdAt')
    .lean();
    
    res.send(posts);
  } catch (err) {
    res.send({
      success: false,
      message: err.message,
    });
  }
};
