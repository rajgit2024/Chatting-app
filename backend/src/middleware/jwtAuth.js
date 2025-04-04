const jwt=require("jsonwebtoken");

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


//Generate krte wakt humme user ka payload chahiye; payload=userdate
//Generate token ek function hai
//Jisme ki payload or userDate and Secret key hota hai
const generateToken=(userData)=>{
    return jwt.sign(userData, process.env.JWT_KEY, { expiresIn: "1h" });
}

// Middleware to check if user is a group admin
const groupAdminMiddleware = async (req, res, next) => {
    const { chat_id } = req.params;
    const user_id = req.user.id;

    try {
        const result = await pool.query(
            "SELECT role FROM chat_members WHERE chat_id = $1 AND user_id = $2",
            [chat_id, user_id]
        );

        if (result.rows.length === 0 || result.rows[0].role !== 'admin') {
            return res.status(403).json({ message: "Access denied: Admins only" });
        }

        next();
    } catch (error) {
        return res.status(500).json({ error: "Database error" });
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
    groupAdminMiddleware
}