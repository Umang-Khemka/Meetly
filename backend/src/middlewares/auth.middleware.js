import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    
    console.log("🔍 Auth Middleware - Token present:", !!token); // Debug log

    if (!token) {
      console.log("❌ No token found in cookies"); // Debug log
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Token decoded successfully, User ID:", decoded.id); // Debug log
    } catch (jwtError) {
      console.log("❌ JWT verification failed:", jwtError.message); // Debug log
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.log("❌ User not found for ID:", decoded.id); // Debug log
      return res.status(404).json({ message: "User Not Found" });
    }

    console.log("✅ User authenticated:", user.email); // Debug log
    req.user = user;
    next();
  } catch (error) {
    console.log("💥 Error in authMiddleware:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { authMiddleware };