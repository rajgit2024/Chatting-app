const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary.js");

const storage = new CloudinaryStorage({
   cloudinary:cloudinary,
    params: {
        folder: "profile_pictures",
        format: async (req, file) => file.mimetype.split("/")[1], // Dynamically set format
         public_id: (req, file) => `user_${req.params.user_id}`, // Use original file name
        allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "svg"],
    },
});

const upload = multer({ storage });

module.exports = upload;
