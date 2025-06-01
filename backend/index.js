const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
const router = require("./src/routes/userRoute.js");
const chatRouter = require("./src/routes/chatRoutes.js");
const messageRouter = require("./src/routes/messagesRoutes.js");
const setupSocket = require("./src/socket/socket.js");

const app = express();
const PORT = 5000;
const server = http.createServer(app);
const io = setupSocket(server);

app.set("io", io);

// Middleware
app.use(cors());
app.use(express.json()); // Parses JSON payloads in requests
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB.",
      })
    }
  }

  if (error.message === "Only image files are allowed!") {
    return res.status(400).json({
      success: false,
      message: "Only image files are allowed!",
    })
  }

  res.status(500).json({
    success: false,
    message: "Something went wrong!",
  })
})
app.use("/api/users", router);
app.use("/api/chats", chatRouter);
app.use("/api/messages", messageRouter);

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
