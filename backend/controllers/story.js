const Story = require("../models/Story");
const { v4: id } = require("uuid");
const User = require("../models/User");

exports.getStory = async (req, res) => {
  try {
    if (req.query.highlight === "true") {
      const story = await Story.findOne({ id: req.params.id });
      return res.send(story);
    }
    const story = await Story.findOne({
      $and: [
        { id: req.params.id },
        { createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      ],
    });
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
    });
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

    const user = await User.findOne({ _id: req.user._id });
    
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    // Fetch stories for all followings in a single query instead of one query per following
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    // If there are no followings, short-circuit
    if (!user.followings || user.followings.length === 0) {
      return res.send([]);
    }

    const stories = await Story.find({
      owner: { $in: user.followings },
      createdAt: { $gt: since },
    })
      .sort({ createdAt: -1 })
      .select("id owner data createdAt seen")
      .lean();

    // Group stories by owner to keep previous response shape (array of arrays)
    const grouped = {};
    for (const s of stories) {
      const key = s.owner.toString();
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(s);
    }

    const allStories = Object.values(grouped);
    res.send(allStories);
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
