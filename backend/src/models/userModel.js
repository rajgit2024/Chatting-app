const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../config/db.js");

// Add new user (hashed password)
const registerrUser = async (username, email, hashPassword, phone_number) => {
    try {
        const result = await pool.query(
            "INSERT INTO users (username, email, password, phone_number) VALUES ($1, $2, $3, $4) RETURNING *",
            [username, email, hashPassword, phone_number]
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
const updateUserProfileById = async (user_id, username, phone_number, profile_pic) => {
    const result = await pool.query(
        "UPDATE users SET username = $1, phone_number = $2, profile_pic = $3 WHERE id = $4 RETURNING id, name, email, phone_number, profile_pic",
        [username, phone_number, profile_pic, user_id]
    );
    return result.rows[0];
};

// Get user profile by ID
const getUserById = async (user_id) => {
    const result = await pool.query(
        "SELECT id, username, email, phone_number, profile_pic FROM users WHERE id = $1",
        [user_id]
    );
    return result.rows[0];
};

//To update user profile picture
// const updateProfilePicture = async (user_id, profile_pic) => {
//     const result = await pool.query(
//         "UPDATE users SET profile_pic=$1 WHERE user_id=$2 RETURNING user_id, profile_pic",
//         [profile_pic, user_id]
//     );
//     return result.rows[0];
// };

  const updateProfilePicture = async(userId, profilePicUrl, cloudinaryId) =>{
    try {
      const query = `
        UPDATE users 
        SET profile_pic = $1, cloudinary_id = $2
        WHERE id = $3 
        RETURNING id, username, email, profile_pic, cloudinary_id
      `
      const result = await pool.query(query, [profilePicUrl, cloudinaryId, userId])
      return result.rows[0] || null
    } catch (error) {
      throw new Error("Error updating profile picture: " + error.message)
    }
  }

  // Get user's current cloudinary_id (for deletion)
  const getCloudinaryId = async(userId) =>{
    try {
      const query = "SELECT cloudinary_id FROM users WHERE id = $1"
      const result = await pool.query(query, [userId])
      return result.rows[0]?.cloudinary_id || null
    } catch (error) {
      throw new Error("Error fetching cloudinary ID: " + error.message)
    }
  }

const getAllUsersExceptCurrent = async (currentUserId) => {
    const result = await pool.query(
      "SELECT id, username, email FROM users WHERE id != $1",
      [currentUserId]
    );
    return result.rows;
  };

  //Search user by userId
const searchUsers = async (query, userId) => {
    const searchQuery = `
      SELECT id, username, email, profile_pic 
      FROM users 
      WHERE (username ILIKE $1 OR email ILIKE $1) 
      AND id != $2 
      LIMIT 20
    `;
    const values = [`%${query}%`, userId];
    const result = await pool.query(searchQuery, values);
    return result.rows;
  };

  const isGroupAdmin = async (chat_id, user_id) => {
  const query=`SELECT role FROM chat_members WHERE chat_id=$1 and user_id=$2`

  try {
    const result = await pool.query(query, [chat_id, user_id]);
    return result.rowCount > 0; // true if user is admin
  } catch (err) {
    console.error("DB error in isGroupAdmin:", err);
    throw err;
  }
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
    getAllUsersExceptCurrent,
    searchUsers,
    isGroupAdmin,
    getCloudinaryId,
};
