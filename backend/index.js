const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
const router = require("../backend/src/routes/auth.js");
const chatRouter = require("../backend/src/routes/chatRoutes.js");
const messageRouter = require("./src/routes/messagesRoutes");
const setupSocket = require("./src/socket/socket.js");

const app = express();
const PORT = 5000;
const server = http.createServer(app)
const io = setupSocket(server)

// Middleware
app.use(cors());
app.use(express.json()); // Parses JSON payloads in requests
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data

app.use("/chats", (req, res, next) => {
    req.io = io;
    next();
  }, chatRouter);
  
  app.use("/messages", (req, res, next) => {
    req.io = io;
    next();
  }, messageRouter);

app.use("/api/users", router);
app.use("/chats", chatRouter);
app.use("/messages", messageRouter);

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
