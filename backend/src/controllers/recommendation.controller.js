import {
  getRecommendations,
  getSimilarProducts,
} from "../services/ai.service.js";
import User from "../models/user.model.js";
import Wishlist from "../models/wishlist.model.js";
import Order from "../models/order.model.js";

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
      .populate("browsingHistory.product");

    // Get wishlist from separate collection
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    // Get user's order history to analyze purchased categories
    const orders = await Order.find({ user: req.user._id }).populate(
      "orderItems.product",
    );

    // Extract categories from purchased products
    const purchasedCategories = [];
    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        if (item.product && item.product.category) {
          purchasedCategories.push(item.product.category);
        }
      });
    });

    // Extract categories from browsing history
    const browsingCategories = [];
    if (user.browsingHistory) {
      user.browsingHistory.forEach((item) => {
        if (item.product && item.product.category) {
          browsingCategories.push(item.product.category);
        }
      });
    }

    // Extract categories from wishlist
    const wishlistProductIds = wishlist?.products || [];

    // Get cart items
    const cartProductIds =
      user.cartItems
        ?.filter((item) => item.product)
        .map((item) => item.product._id.toString()) || [];

    const userContext = {
      browsingHistory:
        user.browsingHistory
          ?.filter((item) => item.product)
          .map((item) => item.product._id.toString()) || [],
      browsingCategories: [...new Set(browsingCategories)],
      purchases: [...new Set(purchasedCategories)],
      wishlist: wishlistProductIds.map((p) => p.toString()),
      cartItems: cartProductIds,
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
