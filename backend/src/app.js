import express from "express";
import { Server } from "socket.io";
import http from "http";
import authRoutes from "./routes/auth.js";

const app=express();
const PORT=5000;

app.use("/api/auth",authRoutes)

app.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`);
})