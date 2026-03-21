import {
  getRecommendations,
  getSimilarProducts,
} from "../services/ai.service.js";
import User from "../models/user.model.js";

/**
 * Get AI-powered personalized recommendations
 * @route GET /api/recommendations
 * @access Private
 */
export const getPersonalizedRecommendations = async (req, res) => {
  try {
    // Get user context for AI
    const user = await User.findById(req.user._id)
      .populate("cartItems.product")
      .populate("wishlist");

    const userContext = {
      browsingHistory: user.browsingHistory || [],
      purchases: [], // Could be populated from orders
      wishlist: user.wishlist?.items?.map((i) => i.toString()) || [],
    };

    const recommendations = await getRecommendations(userContext);

    res.json({
      success: true,
      recommendations,
    });
  } catch (error) {
    console.error("Error in getPersonalizedRecommendations:", error.message);
    res.status(500).json({ message: "Failed to get recommendations" });
  }
};

/**
 * Get similar products to a given product
 * @route GET /api/recommendations/similar/:productId
 * @access Public
 */
export const getSimilarProductsController = async (req, res) => {
  try {
    const { productId } = req.params;
    const similarProducts = await getSimilarProducts(productId);

    res.json({
      success: true,
      products: similarProducts,
    });
  } catch (error) {
    console.error("Error in getSimilarProducts:", error.message);
    res.status(500).json({ message: "Failed to get similar products" });
  }
};
