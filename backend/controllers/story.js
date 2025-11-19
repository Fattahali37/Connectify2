const Story = require("../models/Story");
const { v4: id } = require("uuid");
const User = require("../models/User");

exports.getStory = async (req, res) => {
  try {
    if (req.query.highlight === "true") {
      const story = await Story.findOne({ id: req.params.id })
        .select('id owner data seen createdAt')
        .lean();
      return res.send(story);
    }
    const story = await Story.findOne({
      $and: [
        { id: req.params.id },
        { createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      ],
    })
    .select('id owner data seen createdAt')
    .lean();
    res.send(story);
  } catch (err) {
    res.status(400).send({
      success: false,
      message: err.message,
    });
  }
};

exports.userStory = async (req, res) => {
  try {
    const stories = await Story.find({
      $and: [
        { owner: req.params.uid },
        { createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      ],
    })
    .select('id owner data seen createdAt')
    .sort({ createdAt: -1 })
    .lean();
    res.send(stories);
  } catch (err) {
    res.status(400).send({
      success: false,
      message: err.message,
    });
  }
};

exports.newStory = async (req, res) => {
  try {
    const newStory = new Story({
      id: id(),
      owner: req.user._id,
      data: req.body.data,
      seen: [],
    });
    const story = await newStory.save();
    res.send(story);
  } catch (err) {
    res.status(400).send({
      success: false,
      message: err.message,
    });
  }
};

exports.addSeen = async (req, res) => {
  try {
    const story = await Story.findOne({ id: req.params.id });
    if (story.id === req.user._id)
      return res.send({ success: false, message: "Unsupported" });
    if (story?.seen?.includes(req.user._id))
      return res.send({ success: false, message: "Unsupported" });
    Story.updateOne(
      { id: req.params.id },
      { $push: { seen: req.user._id } }
    ).then(() => {
      res.send({
        success: true,
        message: "done",
      });
    });
  } catch (err) {
    res.status(400).send({
      success: false,
      message: err.message,
    });
  }
};

exports.homeStory = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).send({
        success: false,
        message: "User not authenticated",
      });
    }

    const user = await User.findOne({ _id: req.user._id })
      .select('followings')
      .lean();
    
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // Get all stories from followed users in a single query
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const allStories = await Story.find({
      owner: { $in: user.followings || [] },
      createdAt: { $gt: twentyFourHoursAgo }
    })
    .select('id owner data seen createdAt')
    .sort({ createdAt: -1 })
    .lean();

    // Group stories by owner
    const groupedStories = [];
    const storyMap = new Map();
    
    allStories.forEach(story => {
      const ownerId = story.owner.toString();
      if (!storyMap.has(ownerId)) {
        storyMap.set(ownerId, []);
        groupedStories.push(storyMap.get(ownerId));
      }
      storyMap.get(ownerId).push(story);
    });
    
    res.send(groupedStories);
  } catch (err) {
    console.error("Error in homeStory:", err);
    res.status(400).send({
      success: false,
      message: err.message,
    });
  }
};

// addHighlight

// removeHighlight

// viewHighlight
