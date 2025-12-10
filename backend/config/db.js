require("dotenv").config();
const mongoose = require("mongoose");

// Suppress Mongoose 7 deprecation warning
mongoose.set("strictQuery", false);

exports.connectToDB = async () => {
  try {
    await mongoose.connect(process.env.DataBaseURL);
    console.log("MongoDB connected:", mongoose.connection.host);
  } catch (err) {
    console.log("Failed to connect to database", err);
    process.exit(1);
  }
};
