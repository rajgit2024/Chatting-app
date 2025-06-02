const bcrypt = require("bcrypt");
const userModel = require("../models/userModel.js");
const {generateToken} =require("../middleware/jwtAuth.js");
const { updateProfilePicture } = require("../models/userModel");
const cloudinary = require("../config/cloudinary")
const pool=require("../config/db.js");

const registerUser = async (req, res) => {
    console.log("Request body:", req.body);
    const { username, email, password, phone_number } = req.body;

    // Ensure all required fields are provided
    if (!username || !email || !password || !phone_number) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Check if a user already exists with the provided email
        const existingUserByEmail = await userModel.userByGmail(email);
        const existingUserByPhone = await userModel.userPhone(phone_number);
        if (existingUserByEmail) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }
        if (existingUserByPhone) {
            return res.status(400).json({ message: 'User with this phone number already exists.' });
        }

        // Hash the password before storing it in the database
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        // Create a new user in the database
        const newUser = await userModel.registerrUser(
            username, email, hashPassword, phone_number
        );

        // // Send a verification email to the newly registered user
        // sendVerificationEmail(newUser);

        // Respond with a success message
        return res.status(201).json({
            message: "User created successfully."
        });
    } catch (error) {
        console.error('Error during user registration:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await userModel.userByGmail(email)
    console.log("Retrieved user", user)

    if (!user) {
      return res.status(404).send("User not found")
    }

    const isMatch = await userModel.comparePass(password, user.password)
    console.log("Password match:", isMatch)
    if (!isMatch) return res.status(401).send("Password not match!")

    const payload = {
      email: user.email,
      id: user.id,
    }
    console.log("The given payload is", payload)

    const token = generateToken(payload)
    console.log("The Login token is", token)

    // IMPORTANT: Convert relative path to full URL
    let profilePicUrl = null
    if (user.profile_pic) {
      // If it starts with /uploads, create full URL
      if (user.profile_pic.startsWith("/uploads")) {
        profilePicUrl = `http://localhost:5000${user.profile_pic}`
      } else {
        // If it's just a filename, add the full path
        profilePicUrl = `http://localhost:5000/uploads/${user.profile_pic}`
      }
    }

    console.log("Original profile_pic from DB:", user.profile_pic)
    console.log("Full profile_pic URL:", profilePicUrl)

    return res.status(200).json({
      message: "Login Successful",
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profile_pic: profilePicUrl, // Send full URL instead of relative path
      },
    })
  } catch (error) {
    console.error("Error during login:", error)
    return res.status(500).send("Internal Server Error")
  }
}

//Helps to search users by query
const handleUserSearch = async (req, res) => {
    try {
      const { query } = req.query;
      const userId = req.user.id;
  
      if (!query || query.length < 2) {
        return res
          .status(400)
          .json({ message: 'Search query must be at least 2 characters' });
      }
  
      const users = await userModel.searchUsers(query, userId);
      res.json(users);
    } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

// Get user profile by ID
const getUserProfile = async (req, res) => {
    try {
        const { user_id } = req.params;
        const user = await userModel.userById(user_id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getUsers = async (req, res) => {
    try {
      const currentUserId = req.user.id;
      const users = await userModel.getAllUsersExceptCurrent(currentUserId);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Server error while fetching users" });
    }
  };

// Upload Profile Image & Update Database
const uploadProfileImage = async (req, res) => {
  try {
    console.log("=== UPLOAD PROFILE IMAGE DEBUG ===")
    console.log("User from JWT:", req.user)
    console.log("File received:", req.file)

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    // IMPORTANT: Store just the filename in the database path
    // This should match how your static files are served
    const filePath = `/uploads/${req.file.filename}`
    const userId = req.user.id

    console.log("File saved to:", req.file.path)
    console.log("Database file path:", filePath)
    console.log("User ID:", userId)

    // Update the user's profile_pic in PostgreSQL
    const result = await pool.query("UPDATE users SET profile_pic = $1 WHERE id = $2 RETURNING profile_pic", [
      filePath,
      userId,
    ])

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    console.log("Database updated successfully")
    console.log("New profile_pic value:", result.rows[0].profile_pic)

    // Return the complete URL for the frontend
    const fullUrl = `http://localhost:${process.env.PORT || 5000}${filePath}`

    res.json({
      message: "Profile image uploaded successfully!",
      filePath,
      fullUrl,
      filename: req.file.filename,
    })
  } catch (error) {
    console.error("Error uploading profile image:", error)
    res.status(500).json({ message: "Server error" })
  }
}

//  const updateProfile = async (req, res) => {
//   try {
//     const { profilePic } = req.body;
//     const userId = req.user_id; // assuming user_id is set by auth middleware

//     if (!profilePic) {
//       return res.status(400).json({ message: "Profile pic is required" });
//     }

//     // Upload image to Cloudinary
//     const uploadResponse = await cloudinary.uploader.upload(profilePic);

//     // Update in PostgreSQL
//     const query = `
//       UPDATE users
//       SET profile_pic = $1
//       WHERE id = $2
//       RETURNING id, username, email, profile_pic;
//     `;
//     const values = [uploadResponse.secure_url, userId];

//     const result = await pool.query(query, values);

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json(result.rows[0]);
//   } catch (error) {
//     console.error("Error in update profile:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    uploadProfileImage,
    getUsers,
    handleUserSearch,
}
