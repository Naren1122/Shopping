import express from "express";
import {
  getOverview,
  getSalesAnalytics,
  getOrderAnalytics,
  getTopProducts,
} from "../controllers/analytics.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication and admin role
router.get("/overview", protectRoute, adminRoute, getOverview);
router.get("/sales", protectRoute, adminRoute, getSalesAnalytics);
router.get("/orders", protectRoute, adminRoute, getOrderAnalytics);
router.get("/top-products", protectRoute, adminRoute, getTopProducts);

export default router;
