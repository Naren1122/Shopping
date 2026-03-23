import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getFeaturedProducts,
  getProductsByCategory,
  getRecommendedProducts,
  getProductById,
  toggleFeaturedProduct,
  searchProducts,
  updateProduct,
} from "../controllers/product.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/search", searchProducts); // New search endpoint
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductsByCategory); // Now supports ?page=1&limit=10
router.get("/recommendations", getRecommendedProducts);
router.get("/:id", getProductById); // Get single product by ID

// Admin routes (protected)
router.post("/", protectRoute, adminRoute, createProduct);
router.put("/:id", protectRoute, adminRoute, updateProduct);
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);

export default router;
