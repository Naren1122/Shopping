import express from "express";
import {
  login,
  logout,
  signup,
  refreshToken,
  getProfile,
  updateProfile,
  trackBrowsingHistory,
  forgotPassword,
  resetPassword,
  changePassword,
  checkAuth,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.post("/refresh-token", refreshToken);

// Check if user is authenticated - used to redirect logged-in users away from login/signup pages
router.get("/check-auth", checkAuth);

router.get("/profile", protectRoute, getProfile);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.put("/profile", protectRoute, updateProfile);
router.post("/track-view", protectRoute, trackBrowsingHistory);
router.post("/change-password", protectRoute, changePassword);

export default router;
