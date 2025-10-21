const express = require("express");
require("dotenv").config();
require("./config/db").connectToDB();
const cors = require("cors");
const app = express();
const server = require("http").createServer(app);
app.use(express.json());
app.use(cors());
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const USER_SOCKET_MAP = new Map();

const authRoute = require("./routes/auth");
const postRoute = require("./routes/post");
const userRoute = require("./routes/user");
const chatRoute = require("./routes/chat");
const storyRoute = require("./routes/story");
const adminRoute = require("./routes/admin");
const User = require("./models/User");
const adminController = require("./controllers/admin");

app.use("/auth", authRoute);
app.use("/post", postRoute);
app.use("/user", userRoute);
app.use("/chat", chatRoute);
app.use("/story", storyRoute);
app.use("/api/admin", adminRoute);

// Temporary debug endpoint (bypasses admin router/auth) to trigger profile verification
// Use only in development. Calls controller directly and returns its result.
if (process.env.NODE_ENV !== 'production') {
  app.post('/__debug_verify/:userId', async (req, res, next) => {
    try {
      // attach params and body as expected by controller
      req.params = req.params || {};
      await adminController.verifyProfile(req, res, next);
    } catch (err) {
      next(err);
    }
  });
}

app.get("/test", (req, res) => {
  res.send("Hello from other side");
});

io.on("connect", (socket) => {
  console.log("a user connected", socket.id);
  socket.on("online", async ({ uid }) => {
    USER_SOCKET_MAP.set(socket.id, uid);
    await User.updateOne({ _id: uid }, { $set: { online: true } });
  });
  socket.on("typingon", ({ uid, roomId }) => {
    socket.broadcast.emit(`typinglistenon${roomId}`, uid);
  });
  socket.on("typingoff", ({ uid, roomId }) => {
    socket.broadcast.emit(`typinglistenoff${roomId}`, uid);
  });
  socket.on("disconnect", async () => {
    await User.updateOne(
      { _id: USER_SOCKET_MAP.get(socket.id) },
      { $set: { online: false, lastSeen: Date.now() } }
    );
    USER_SOCKET_MAP.delete(socket.id);
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Server running at port : ${process.env.PORT}`);
});
