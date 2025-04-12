const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../config/db.js");

// Add new user (hashed password)
const registerrUser = async (name, email, hashPassword, phone_number) => {
    try {
        const result = await pool.query(
            "INSERT INTO users (name, email, password, phone_number) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, email, hashPassword, phone_number]
        );
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

// Find user by phone
const userPhone = async (phone_number) => {
    try {
        const result = await pool.query("SELECT * FROM users WHERE phone_number=$1", [phone_number]);
        return result[0];
    } catch (error) {
        throw error;
    }
};

// Find user by ID
const userById = async (id) => {
    try {
        const result = await pool.query("SELECT * FROM users WHERE id=$1", [id]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

// Update password
const updatePassword = async (hashPassword, userId) => {
    try {
        const result = await pool.query(
            "UPDATE users SET password = $1 WHERE id = $2 RETURNING *",
            [hashPassword, userId]
        );
        return result.rows[0];
    } catch (error) {
        console.error("Error in updatePass model function:", error);
        throw error;
    }
};

//User by email
const userByGmail=async(email)=>{
    try {
        console.log('Searching for user with email:', email);
        const result=await pool.query("SELECT * FROM users WHERE email=$1",[email]);
        console.log('Storing result.rows', result.rows);
       return result.rows[0];
    }  catch (error) {
        console.error('Error querying database:', error);
        throw error;
      }
}

// Compare password with hashed password
const comparePass = async (enteredPassword, storedPasswordHash) => {
    try {
        const isMatch = await bcrypt.compare(enteredPassword, storedPasswordHash);
        return isMatch;
    } catch (error) {
        console.error('Error comparing passwords:', error);
        throw error;
    }
};

// Update verification status
const updateVerificationStatus = async (userId) => {
    try {
        return await pool.query('UPDATE users SET is_verified = TRUE WHERE id = $1', [userId]);
    } catch (error) {
        console.error('Error updating verification status:', error);
        throw error;
    }
};

// Update user profile
const updateUserProfileById = async (user_id, name, phone_number, profile_pic) => {
    const result = await pool.query(
        "UPDATE users SET name = $1, phone_number = $2, profile_pic = $3 WHERE id = $4 RETURNING id, name, email, phone_number, profile_pic",
        [name, phone_number, profile_pic, user_id]
    );
    return result.rows[0];
};

// Get user profile by ID
const getUserById = async (user_id) => {
    const result = await pool.query(
        "SELECT id, name, email, phone_number, profile_pic FROM users WHERE id = $1",
        [user_id]
    );
    return result.rows[0];
};

//To update user profile picture
const updateProfilePicture = async (user_id, profile_pic) => {
    const result = await pool.query(
        "UPDATE users SET profile_pic=$1 WHERE user_id=$2 RETURNING user_id, profile_pic",
        [profile_pic, user_id]
    );
    return result.rows[0];
};



module.exports = {
    updateVerificationStatus,
    registerrUser,
    userById,
    userByGmail,
    comparePass,
    updatePassword,
    userPhone,
    updateUserProfileById,
    getUserById,
    updateProfilePicture,
};
