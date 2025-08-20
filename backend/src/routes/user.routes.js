import { Router } from "express";
import { login, register, getCurrentUser, logout } from "../controllers/user.controller.js";
import { addActivity, getAllActivity } from "../controllers/activity.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Auth routes
router.post("/login", login);
router.post("/register", register);
router.post("/logout",logout);
router.get("/current",getCurrentUser); 

// Activity routes
router.post("/add_to_activity", authMiddleware, addActivity);
router.get("/get_all_activity", authMiddleware, getAllActivity);

export default router;
