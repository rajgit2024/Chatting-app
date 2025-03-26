import express from "express";

const router=express.Router();

router.post("/login",(req,res)=>{
    res.send("Login route!")
})

router.post("/register",(req,res)=>{
    res.send("register route!")
})

router.post("/logout",(req,res)=>{
    res.send("Logout route!")
})
export default router;