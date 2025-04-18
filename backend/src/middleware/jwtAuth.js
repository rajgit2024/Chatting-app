const jwt=require("jsonwebtoken");
const { isGroupAdmin } = require("../models/chatModel");
const dotenv = require("dotenv");
dotenv.config();

const jwtAuthMiddleware = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        console.log("Authorization header missing");
        return res.status(401).json({ message: "Token not found!" });
    }

    const token = authorization.split(" ")[1];
    if (!token) {
        console.log("Token missing in Authorization header");
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        console.log("Decoded JWT Payload:", decoded); // Log the entire payload
        req.user = decoded;
        next();
    }catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Token expired" });
        }
        return res.status(401).json({ error: "Invalid token" });
    }
};


const generateToken=(userData)=>{
    return jwt.sign(userData, process.env.JWT_KEY, { expiresIn: "2h" });
}

// Middleware to check if user is a group admin

const groupAdminOnly = async (req, res, next) => {
    const chat_id = req.params.chat_id || req.body.chat_id;
    const user_id = req.user.id;
  
    if (!chat_id) {
      return res.status(400).json({ error: "Chat ID is required." });
    }
  
    try {
      const isAdmin = await isGroupAdmin(chat_id, user_id);
      if (!isAdmin) {
        return res.status(403).json({ error: "Access denied. Admins only." });
      }
      next();
    } catch (error) {
      console.error("Authorization error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

const verifyProfileOwner = (req, res, next) => {
    const { user_id } = req.params;
    if (parseInt(user_id) !== req.user.id) {
        return res.status(403).json({ error: "Access denied: You can only modify your own profile" });
    }
    next();
};

module.exports={
    jwtAuthMiddleware,
    generateToken,
    verifyProfileOwner,
    groupAdminOnly
}