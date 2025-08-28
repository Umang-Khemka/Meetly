import "dotenv/config.js";
import cookieParser from "cookie-parser";
import express from "express";
import http from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import connectToSocket from "./controllers/socketManager.js";
import userRoutes from "./routes/user.routes.js";
import path from "path";
const __dirname = path.resolve();


const app = express();
const server = http.createServer(app);
const io = connectToSocket(server);

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({limit: "40kb"}));
app.use(express.urlencoded({limit: "40kb", extended: true}));


app.use("/api/v1/users",userRoutes);



const PORT = process.env.PORT || 8000;
const MONGO_URL = process.env.MONGO_URL;

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("/*splat", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}


const start = async () => {
  try {
    await mongoose.connect(MONGO_URL);

    console.log("Connected to MongoDB");

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
};

start();
