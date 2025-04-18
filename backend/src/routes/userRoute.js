const express = require("express");
const { registerUser,loginUser,uploadProfilePicture, getUserProfile, } = require("../controllers/userController.js");
const {verifyProfileOwner,jwtAuthMiddleware}=require("../middleware/jwtAuth.js")
const router = express.Router();
const pool = require('../config/db');
const upload = require("../middleware/uploadMiddleware.js");

router.post("/login", loginUser);

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

module.exports = router;
