import express from "express";
import {
  getProductReviews,
  getProductRating,
  createReview,
} from "../controllers/review.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/product/:productId", getProductReviews);
router.get("/product/:productId/rating", getProductRating);
router.post("/", protectRoute, createReview);

export default router;
