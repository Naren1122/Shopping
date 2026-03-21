import express from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, createOrder);
router.get("/", protectRoute, getUserOrders);
router.get("/:id", protectRoute, getOrderById);
router.patch("/:id/status", protectRoute, adminRoute, updateOrderStatus);

export default router;
