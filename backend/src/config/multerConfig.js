const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the uploads folder exists (important for cloud deployments)
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // Ensure this folder exists
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);

    if (extName && mimeType) {
        return cb(null, true);
    } else {
        return cb(new Error("Only images (JPG, JPEG, PNG) are allowed!"));
    }
};

// Multer upload function
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: fileFilter
});

module.exports = upload;

// const uploadProfileImage = async (req, res) => {
//     try {
//       if (!req.file) {
//         return res.status(400).json({ message: "No file uploaded" });
//       }
  
//       const filePath = `/uploads/${req.file.filename}`; // Store image path
//       const userId = req.user.id; // Get user ID from JWT middleware
  
//       // Update the user's profile_image in PostgreSQL
//       const result = await pool.query(
//         "UPDATE users SET profile_pic = $1 WHERE id = $2 RETURNING profile_pic",
//         [filePath, userId]
//       );
  
//       if (result.rowCount === 0) {
//         return res.status(404).json({ message: "User not found" });
//       }
  
//       res.json({
//         message: "Profile image uploaded successfully!",
//         filePath,
//       });
  
//     } catch (error) {
//       console.error("Error uploading profile image:", error);
//       res.status(500).json({ message: "Server error" });
//     }
//   };