const db = require("../config/db"); // adjust to your DB connection file
const cloudinary = require("../config/cloudinary");

const uploadImage = async (req, res) => {
  try {
    const user_id = req.user?.id;
    if (!user_id || !req.file?.path) {
      return res.status(400).json({ error: "User or image missing" });
    }

    const imageUrl = req.file.path;
    const publicId = req.file.filename;

    // Store in DB
    await db.query(
      "UPDATE users SET profile_pic = $1, cloudinary_id = $2 WHERE id = $3",
      [imageUrl, publicId, user_id]
    );

    res.status(200).json({
      message: "Image uploaded",
      url: imageUrl,
      public_id: publicId,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
};

module.exports={
    uploadImage,
}