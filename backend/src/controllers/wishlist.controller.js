import Wishlist from "../models/wishlist.model.js";

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      "products",
    );

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    res.json(wishlist.products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      "products",
    );

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [productId],
      });
      // Re-fetch with populate for consistent return
      wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
        "products",
      );
    } else {
      // Check if product already exists by comparing IDs
      const exists = wishlist.products.some(
        (p) => p._id.toString() === productId,
      );
      if (exists) {
        return res.status(400).json({ message: "Product already in wishlist" });
      }
      // Add new product
      wishlist.products.push(productId);
      await wishlist.save();
      // Re-populate to get full product data
      wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
        "products",
      );
    }

    res.json(wishlist.products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  try {
    console.log("Backend: Removing product:", req.params.productId);
    console.log("Backend: User ID:", req.user?._id);

    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      "products",
    );

    if (!wishlist) {
      console.log("Backend: Wishlist not found");
      return res.status(404).json({ message: "Wishlist not found" });
    }

    console.log(
      "Backend: Current products:",
      wishlist.products.map((p) => p._id.toString()),
    );

    wishlist.products = wishlist.products.filter(
      (p) => p._id.toString() !== req.params.productId,
    );
    await wishlist.save();

    console.log(
      "Backend: Remaining products:",
      wishlist.products.map((p) => p._id.toString()),
    );

    res.json(wishlist.products);
  } catch (error) {
    console.log("Backend: Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
