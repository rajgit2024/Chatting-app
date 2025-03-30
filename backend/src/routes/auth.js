const express = require("express");
const { registerUser,loginUser } = require("../controllers/userController.js");
const router = express.Router();

router.post("/login",loginUser);

router.post("/register", registerUser);

router.post("/logout");

module.exports = router;
