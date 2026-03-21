import Review from "../models/review.model.js";
import Product from "../models/product.model.js";

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get average rating for a product
// @route   GET /api/reviews/product/:productId/rating
// @access  Public
export const getProductRating = async (req, res) => {
  try {
    const result = await Review.aggregate([
      { $match: { product: req.params.productId } },
      {
        $group: {
          _id: "$product",
          averageRating: { $avg: "$rating" },
          numReviews: { $sum: 1 },
        },
      },
    ]);

    if (result.length === 0) {
      return res.json({ averageRating: 0, numReviews: 0 });
    }

    res.json({
      averageRating: result[0].averageRating.toFixed(1),
      numReviews: result[0].numReviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Check if user has ordered and received this product
    const order = await Order.findOne({
      user: req.user._id,
      "orderItems.product": productId,
      orderStatus: "delivered", // Must be delivered
    });

    if (!order) {
      return res.status(403).json({
        message: "You can only review products you have purchased and received",
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: req.user._id,
      product: productId,
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You already reviewed this product" });
    }

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating,
      comment,
    });

    await review.populate("user", "name");

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
