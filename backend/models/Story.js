const mongoose = require("mongoose");

const StorySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    data: {
      type: String,
      require: true,
    },
    seen: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
  },
  { timestamps: true }
);

// Index to support fetching recent stories for a list of owners
StorySchema.index({ owner: 1, createdAt: -1 });

module.exports = new mongoose.model("story", StorySchema);
