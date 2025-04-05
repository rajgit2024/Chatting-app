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

app.use("/api/users", router);
app.use("/api/chats", chatRouter);
app.use("/api/messages", messageRouter);

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
