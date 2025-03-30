const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
const router = require("../backend/src/routes/auth.js");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Parses JSON payloads in requests
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data

app.use("/api/users", router);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
