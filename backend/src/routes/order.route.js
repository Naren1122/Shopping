import express from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  cancelOrder,
  deleteOrder,
} from "../controllers/order.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Admin routes (must be before user routes)
router.get("/admin/all", protectRoute, adminRoute, getAllOrders);
router.patch("/:id/status", protectRoute, adminRoute, updateOrderStatus);
router.patch("/:id/cancel", protectRoute, cancelOrder);
router.delete("/:id", protectRoute, deleteOrder);

// User routes
router.post("/", protectRoute, createOrder);
router.get("/", protectRoute, getUserOrders);
router.get("/:id", protectRoute, getOrderById);

export default router;
