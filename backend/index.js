const express = require("express")
const { Server } = require("socket.io")
const http = require("http")
const cors = require("cors")
const router = require("./src/routes/userRoute.js")
const chatRouter = require("./src/routes/chatRoutes.js")
const messageRouter = require("./src/routes/messagesRoutes.js")
const setupSocket = require("./src/socket/socket.js")
const multer = require("multer")
const morgan = require("morgan") // Optional for logging
const cookieParser = require("cookie-parser")
const path = require("path")
const fs = require("fs")

const app = express()
const PORT = 5000
const server = http.createServer(app)
const io = setupSocket(server)

app.set("io", io)

app.use(morgan("dev"))

// Middleware
app.use(cors())
app.use(express.json()) // Parses JSON payloads in requests
app.use(express.urlencoded({ extended: true })) // Parses URL-encoded data
app.use(cookieParser())

// FIXED: Static file serving for uploads
const uploadsPath = path.join(__dirname, "src", "uploads")
console.log("=== STATIC FILE SERVING DEBUG ===")
console.log("Current directory (__dirname):", __dirname)
console.log("Uploads path:", uploadsPath)
console.log("Uploads directory exists:", fs.existsSync(uploadsPath))

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsPath)) {
  console.log("Creating uploads directory...")
  fs.mkdirSync(uploadsPath, { recursive: true })
}

// List files in uploads directory for debugging
try {
  const files = fs.readdirSync(uploadsPath)
  console.log("Files in uploads directory:", files)
} catch (error) {
  console.log("Error reading uploads directory:", error.message)
}

// Serve static files from uploads directory
app.use("/uploads", express.static(uploadsPath))

// Add CORS headers for uploaded files
app.use("/uploads", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

// Debug route to test uploads directory
app.get("/test-uploads", (req, res) => {
  try {
    const files = fs.readdirSync(uploadsPath)
    const fileDetails = files.map((file) => {
      const filePath = path.join(uploadsPath, file)
      const stats = fs.statSync(filePath)
      return {
        filename: file,
        size: stats.size,
        created: stats.birthtime,
        url: `http://localhost:${PORT}/uploads/${file}`,
      }
    })

    res.json({
      uploadsPath,
      totalFiles: files.length,
      files: fileDetails,
    })
  } catch (error) {
    res.status(500).json({
      error: "Error reading uploads directory",
      message: error.message,
      uploadsPath,
    })
  }
})

// Debug route to check if specific file exists
app.get("/file-exists/:filename", (req, res) => {
  const filename = req.params.filename
  const filePath = path.join(uploadsPath, filename)
  const exists = fs.existsSync(filePath)

  res.json({
    filename,
    exists,
    filePath,
    url: exists ? `http://localhost:${PORT}/uploads/${filename}` : null,
  })
})

// Enhanced error handling for multer
app.use((error, req, res, next) => {
  console.log("=== ERROR HANDLER ===")
  console.log("Error:", error)

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
    error: error.message,
  })
})

// Routes
app.use("/api/users", router)
app.use("/api/chats", chatRouter)
app.use("/api/messages", messageRouter)

// Enhanced server startup with debugging
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log("=== SERVER STARTUP DEBUG ===")
  console.log("Uploads directory:", uploadsPath)
  console.log("Test uploads endpoint: http://localhost:" + PORT + "/test-uploads")
  console.log("================================")
})
