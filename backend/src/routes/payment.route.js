import express from "express";
import {
  initiateEsewaPayment,
  verifyEsewaPayment,
  esewaSuccess,
  esewaFailure,
} from "../controllers/payment.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// eSewa payment routes
router.post("/esewa/initiate", protectRoute, initiateEsewaPayment);
router.post("/esewa/verify", protectRoute, verifyEsewaPayment);

// Callback URLs (called by eSewa after payment)
router.get("/esewa/success", esewaSuccess);
router.get("/esewa/failure", esewaFailure);

export default router;
