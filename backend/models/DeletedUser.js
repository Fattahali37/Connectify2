const mongoose = require("mongoose");

const deletedUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  deletedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = new mongoose.model("DeletedUser", deletedUserSchema);
