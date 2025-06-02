const express = require("express");
const { registerUser,loginUser,uploadProfileImage, getUserProfile,handleUserSearch,updateProfile } = require("../controllers/userController.js");
const {verifyProfileOwner,jwtAuthMiddleware,debugUserMiddleware}=require("../middleware/jwtAuth.js")
const router = express.Router();
const {uploadImage}=require("../controllers/uploadController.js")
const upload = require("../config/multerConfig");

// const requestLogger = (req, res, next) => {
//   console.log("=== Request Logger ===")
//   console.log(`${req.method} ${req.url}`)
//   console.log("Headers:", req.headers)
//   console.log("Params:", req.params)
//   console.log("Query:", req.query)
//   next()
// }

router.post("/login",loginUser);

router.post("/register", registerUser);

router.post("/logout");
router.get("/profile",getUserProfile)

// Upload profile picture route with enhanced debugging
// router.post(
//   "/profile/:user_id/picture",
//   requestLogger, // Log the request
//   jwtAuthMiddleware, // Check if user is authenticated
//   verifyProfileOwner, // Check if user owns the profile
//   debugMulter, // Debug multer processing
//   uploadProfileImage, // Controller function
// )
router.post(
    "/upload-profile-image",
    jwtAuthMiddleware,
    debugUserMiddleware,
    upload.single("profile_pic"),
    // verifyProfileOwner,
     uploadProfileImage
  );
router.get('/search', jwtAuthMiddleware, handleUserSearch);

module.exports = router;
