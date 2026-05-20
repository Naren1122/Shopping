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
  registerVendor,
  updateVendorProfile,
  approveVendor,
} from "../controllers/auth.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/vendor/register", registerVendor);

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

// Vendor profile update
router.put("/vendor/profile", protectRoute, updateVendorProfile);

// Admin: Approve or reject vendor
router.patch("/vendor/:id/approve", protectRoute, adminRoute, approveVendor);

export default router;
