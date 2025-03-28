import express from "express";
import bcrypt from "bcryptjs";
import pool from "../config/db.js"

//Add new user (hashed password)
const registerUser= async(name, email, password, phone_number)=>{
    try {
        
    const result=await pool.query("INSERT INTO users (name,email,password,phone_number)  VALUES ($1,$2,$3,$4) RETURNING *",[name,email,password,phone_number]);
    return result.rows[0];

    } catch (error) {
        throw error;
    } 
}
//find user by phone
const userPhone=async(phone_number)=>{
    const result=await pool.query("SELECT * FROM users WHERE phone_number=$1",[phone_number]);
    return result;
}

//find user by id
const userById=async (id)=>{
try {
    const result=await pool.query("SELECT * FROM users WHERE id=$1",[id]);
    return result.rows[0];
} catch (error) {
    throw error;
}
}
//Update password
const updatePassword = async (hashedPassword, userId) => {
    try {
        const result = await pool.query(
            "UPDATE users SET password = $1 WHERE id = $2 RETURNING *",
            [hashedPassword, userId]
        );
        return result.rows[0];
    } catch (error) {
        console.error("Error in updatePass model function:", error);
        throw error;
    }
};

//Find user by gmail
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

//Compare password with hash password

const comparePass= async (enteredPassword, storedPasswordHash) => {
    try {
     const isMatch =  await bcrypt.compare(enteredPassword, storedPasswordHash);
    return isMatch;
    } catch (error) {
      console.error('Error comparing passwords:', error);
      throw error;
    }
  };


const updateVerificationStatus = async (userId) => {
    try {
      return  await pool.query('UPDATE users SET is_verified = TRUE WHERE id = $1', [userId]);
    } catch (error) {                                    
        console.error('Error updating verification status:', error);
        throw error;
    }
};

  

const userModel = {
    updateVerificationStatus,
    registerUser,
    userById,
    userByGmail,
    comparePass,
    updatePassword,
    userPhone,
}
export default userModel;
