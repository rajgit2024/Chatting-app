import express from "express";
import bcrypt from "bcryptjs";
import userModel from "../models/userModel";

const registerUser = async (req, res) => {
    const { name,email,password,phone_number } = req.body;

    // Ensure all required fields are provided
    if (!name || !email || !password || !phone_number) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Check if a user already exists with the provided email
        const existingUserByEmail = await userModel.userByGmail(email);
        const existingUserByPhone = await userModel.userPhone(phone_number);
        if (existingUserByEmail || existingUserByPhone) {
            return res.status(400).json({ message: 'User with this email or  mobile number already exists.' });
        }
      
        // Hash the password before storing it in the database
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        // Create a new user in the database
        const newUser = await userModel.registerUser(
            name,email,password,phone_number
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

const userController={
    registerUser,
}

export default userController;

