// Import required packages
const express = require("express");
const session = require("express-session");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

// Import Routes
const userRoute = require("./src/routes/userRoute.js");
const chatRoute = require("./src/routes/chatRoutes.js");
const messageRoute = require("./src/routes/messagesRoutes.js");

// Import WebSocket setup
const setupSocket = require("./src/socket/socket.js");

// Initialize app and server
const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = setupSocket(server); // Attach socket to server
app.set("io", io);

// === Middlewares ===
app.use(morgan("dev")); // Request logger
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000", // Frontend origin
  credentials: true,
}));
app.use(express.json()); // Parse JSON requests
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(cookieParser());

// === Serve static files (images/uploads) ===
const uploadsPath = path.join(__dirname, "src", "uploads");
app.use("/uploads", express.static(uploadsPath));

// Add CORS headers specifically for uploaded images
app.use("/uploads", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// === Routes ===
app.use("/api/users", userRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);

// === Multer Upload Error Handling ===
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB.",
      });
    }
  }
  if (error.message === "Only image files are allowed!") {
    return res.status(400).json({
      success: false,
      message: "Only image files are allowed!",
    });
  }

  // Generic error
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
  });
});

// === Start Server ===
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log("📂 Serving uploads from:", uploadsPath);
});
