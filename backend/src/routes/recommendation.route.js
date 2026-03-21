import express from "express";
import {
  getPersonalizedRecommendations,
  getSimilarProductsController,
} from "../controllers/recommendation.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Get personalized AI recommendations
router.get("/", protectRoute, getPersonalizedRecommendations);

// Get similar products (public)
router.get("/similar/:productId", getSimilarProductsController);

export default router;
