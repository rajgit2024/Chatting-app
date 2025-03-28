import express from "express";
import userController from "../controllers/userController";;
const router=express.Router();

router.post("/login",(req,res)=>{
    res.send("Login route!")
})

router.post("/register",userController.registerUser);

<<<<<<< HEAD
router.post("/hello",(req,res)=>{
    res.send("hello route!")
})

=======
>>>>>>> 28d0f5a (Initial commit with front-end and backend folders)
router.post("/logout",(req,res)=>{
    res.send("Logout route!")
})
export default router;