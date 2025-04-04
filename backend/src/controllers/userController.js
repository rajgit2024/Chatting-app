const bcrypt = require("bcrypt");
const userModel = require("../models/userModel.js");
const {generateToken} =require("../middleware/jwtAuth.js");
const { updateProfilePicture } = require("../models/userModel");

const registerUser = async (req, res) => {
    console.log("Request body:", req.body);
    const { name, email, password, phone_number } = req.body;

    // Ensure all required fields are provided
    if (!name || !email || !password || !phone_number) {
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
            name, email, hashPassword, phone_number
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

const loginUser=async(req,res)=>{
    const{email,password}=req.body;
    try {
        const user=await userModel.userByGmail(email);
        console.log("Retriev user",user);
        // if(!user.is_verified){
        //     console.log(`Verify your email to login`);
        //     return res.status(500).json({message:"Email is not verified!"})
        // } 
        
        if(!user){
          return res.status(404).send("User not found")
        } 
        const isMatch=await userModel.comparePass(password,user.password);
        console.log('Password match:', isMatch);
        if (!isMatch) return res.status(401).send("Password not match!");

        const payload={
            email:user.email,
            id:user.id,
            role:user.role
        }
        console.log("The given payload is",payload);
        
       const token=generateToken(payload);
       console.log("The Login token is",token);
       return res.status(200).json({message:"Login Sucessfull",token:token});
        } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).send('Internal Server Error');
    }
   
}

// Get user profile by ID
const getUserProfile = async (req, res) => {
    try {
        const { user_id } = req.params;
        const user = await getUserById(user_id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Update user profile picture


// Update Profile Picture Only
const uploadProfilePicture = async (req, res) => {
    try {
        console.log("Headers:", req.headers);
        console.log("Request Body:", req.body);
        console.log("Request File Object:", req.file); // Should contain file data
        const { user_id } = req.params;

        if (!req.file || !req.file.path) {
            return res.status(400).json({ error: "Profile picture is required" });
        }

        const profile_pic_url = req.file.path; // Cloudinary URL

        const updatedUser = await updateProfilePicture(user_id, profile_pic_url);

        res.status(200).json({
            message: "Profile picture updated successfully",
            profile_pic: updatedUser.profile_pic
        });
    } catch (error) {
        console.error("Error updating profile picture:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    uploadProfilePicture
}
