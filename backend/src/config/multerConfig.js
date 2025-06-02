const multer = require("multer")
const path = require("path")
const fs = require("fs")

// Since your uploads folder is at src/uploads, and this file is at src/config/multer.js
const uploadDir = path.join(__dirname, "..", "uploads")
console.log("Multer upload directory:", uploadDir)

// Ensure the uploads directory exists
if (!fs.existsSync(uploadDir)) {
  console.log("Creating uploads directory:", uploadDir)
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Saving file to:", uploadDir)
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const userId = req.user?.id || "unknown"
    const timestamp = Date.now()
    const ext = path.extname(file.originalname)
    const filename = `profile_${userId}_${timestamp}${ext}`
    console.log("Generated filename:", filename)
    cb(null, filename)
  },
})

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimeType = allowedTypes.test(file.mimetype)

  if (extName && mimeType) {
    cb(null, true)
  } else {
    cb(new Error("Only images (JPG, JPEG, PNG, GIF, WebP) are allowed!"), false)
  }
}

// Multer upload function
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
})

module.exports = upload
