const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    require: true,
  },
  people: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  lastSeen: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  lastMessage: {
    timestamp: {
      type: Date,
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
});

module.exports = new mongoose.model("room", roomSchema);
