const express = require("express");
const { registerUser,loginUser,uploadProfilePicture, getUserProfile,getUsers } = require("../controllers/userController.js");
const {verifyProfileOwner,jwtAuthMiddleware}=require("../middleware/jwtAuth.js")
const router = express.Router();
const upload = require("../middleware/uploadMiddleware.js");

router.post("/login",loginUser);

router.post("/register", registerUser);

router.post("/logout");
router.get("/profile",getUserProfile)
router.put(
    "/profile/:user_id/picture",
    jwtAuthMiddleware, // Auth middleware
    verifyProfileOwner, // User authorization check
    upload.single("profile_pic"),
    uploadProfilePicture // Controller function
);
router.get("/all",jwtAuthMiddleware,getUsers)

module.exports = router;
