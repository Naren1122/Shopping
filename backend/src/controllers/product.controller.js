import Product from "../models/product.model.js";
import Review from "../models/review.model.js";
import cloudinary from "../lib/cloudinary.js";
import { redis } from "../lib/redis.js";

export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find({}).skip(skip).limit(limit).lean();
    const total = await Product.countDocuments({});

    // Get review stats for each product
    const productIds = products.map((p) => p._id);
    const reviewStats = await Review.aggregate([
      { $match: { product: { $in: productIds } } },
      {
        $group: {
          _id: "$product",
          averageRating: { $avg: "$rating" },
          numReviews: { $sum: 1 },
        },
      },
    ]);

    // Create a map for quick lookup
    const reviewMap = new Map(
      reviewStats.map((r) => [
        r._id.toString(),
        {
          averageRating: Math.round(r.averageRating * 10) / 10,
          numReviews: r.numReviews,
        },
      ]),
    );

    // Add rating info to each product
    const productsWithRatings = products.map((product) => ({
      ...product,
      averageRating: reviewMap.get(product._id.toString())?.averageRating || 0,
      numReviews: reviewMap.get(product._id.toString())?.numReviews || 0,
    }));

    res.json({
      products: productsWithRatings,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.log("Error in getAllProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  const { category } = req.query;
  try {
    // Build query: filter by isFeatured and optionally by category
    const query = { isFeatured: true };
    if (category && category !== "all") {
      query.category = new RegExp("^" + category + "$", "i");
    }

    // Try to get from Redis cache
    try {
      const cacheKey =
        category && category !== "all"
          ? "featured_products_" + category
          : "featured_products";
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    } catch (redisError) {
      console.log(
        "Redis get error, falling back to MongoDB:",
        redisError.message,
      );
    }

    // if not in redis, fetch from mongodb
    const featuredProducts = await Product.find(query).lean();

    if (!featuredProducts) {
      return res.status(404).json({ message: "No featured products found" });
    }

    // Get review stats for each product
    const productIds = featuredProducts.map((p) => p._id);
    const reviewStats = await Review.aggregate([
      { $match: { product: { $in: productIds } } },
      {
        $group: {
          _id: "$product",
          averageRating: { $avg: "$rating" },
          numReviews: { $sum: 1 },
        },
      },
    ]);

    // Create a map for quick lookup
    const reviewMap = new Map(
      reviewStats.map((r) => [
        r._id.toString(),
        {
          averageRating: Math.round(r.averageRating * 10) / 10,
          numReviews: r.numReviews,
        },
      ]),
    );

    // Add rating info to each product
    const productsWithRatings = featuredProducts.map((product) => ({
      ...product,
      averageRating: reviewMap.get(product._id.toString())?.averageRating || 0,
      numReviews: reviewMap.get(product._id.toString())?.numReviews || 0,
    }));

    // Try to store in redis for future quick access
    try {
      const cacheKey =
        category && category !== "all"
          ? "featured_products_" + category
          : "featured_products";
      await redis.set(cacheKey, JSON.stringify(productsWithRatings));
    } catch (redisError) {
      console.log("Redis set error:", redisError.message);
    }

    res.json(productsWithRatings);
  } catch (error) {
    console.log("Error in getFeaturedProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;

    let cloudinaryResponse = null;

    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse?.secure_url
        ? cloudinaryResponse.secure_url
        : "",
      category,
    });

    res.status(201).json(product);
  } catch (error) {
    console.log("Error in createProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy("products/" + publicId);
      } catch (error) {
        console.log("error deleting image from cloudinary", error);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error in deleteProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Use case-insensitive regex for category matching
    const products = await Product.find({
      category: new RegExp("^" + category + "$", "i"),
    })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments({
      category: new RegExp("^" + category + "$", "i"),
    });

    // Get review stats for each product
    const productIds = products.map((p) => p._id);
    const reviewStats = await Review.aggregate([
      { $match: { product: { $in: productIds } } },
      {
        $group: {
          _id: "$product",
          averageRating: { $avg: "$rating" },
          numReviews: { $sum: 1 },
        },
      },
    ]);

    // Create a map for quick lookup
    const reviewMap = new Map(
      reviewStats.map((r) => [
        r._id.toString(),
        {
          averageRating: Math.round(r.averageRating * 10) / 10,
          numReviews: r.numReviews,
        },
      ]),
    );

    // Add rating info to each product
    const productsWithRatings = products.map((product) => ({
      ...product,
      averageRating: reviewMap.get(product._id.toString())?.averageRating || 0,
      numReviews: reviewMap.get(product._id.toString())?.numReviews || 0,
    }));

    res.json({
      products: productsWithRatings,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.log("Error in getProductsByCategory controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      await updateFeaturedProductsCache();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in toggleFeaturedProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cloudinaryResponse = null;

    // Only upload new image if provided and different from current
    if (image && image !== product.image) {
      // Delete old image
      if (product.image) {
        const publicId = product.image.split("/").pop().split(".")[0];
        try {
          await cloudinary.uploader.destroy("products/" + publicId);
        } catch (error) {
          console.log("error deleting old image", error);
        }
      }
      // Upload new image
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.image = cloudinaryResponse?.secure_url || product.image;

    const updatedProduct = await product.save();
    await updateFeaturedProductsCache();

    res.json(updatedProduct);
  } catch (error) {
    console.log("Error in updateProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

async function updateFeaturedProductsCache() {
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set("featured_products", JSON.stringify(featuredProducts));
  } catch (error) {
    console.log("error in update cache function");
  }
}

// @desc    Get products with pagination
// @route   GET /api/products?page=1&limit=10
// @access  Public
export const getProductsWithPagination = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find({}).skip(skip).limit(limit).lean();
    const total = await Product.countDocuments({});

    // Get review stats for each product
    const productIds = products.map((p) => p._id);
    const reviewStats = await Review.aggregate([
      { $match: { product: { $in: productIds } } },
      {
        $group: {
          _id: "$product",
          averageRating: { $avg: "$rating" },
          numReviews: { $sum: 1 },
        },
      },
    ]);

    // Create a map for quick lookup
    const reviewMap = new Map(
      reviewStats.map((r) => [
        r._id.toString(),
        {
          averageRating: Math.round(r.averageRating * 10) / 10,
          numReviews: r.numReviews,
        },
      ]),
    );

    // Add rating info to each product
    const productsWithRatings = products.map((product) => ({
      ...product,
      averageRating: reviewMap.get(product._id.toString())?.averageRating || 0,
      numReviews: reviewMap.get(product._id.toString())?.numReviews || 0,
    }));

    res.json({
      products: productsWithRatings,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.log("Error in getProductsWithPagination", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Search products by name
// @route   GET /api/products/search?q=keyword
// @access  Public
export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    const products = await Product.find({
      name: { $regex: q, $options: "i" },
    }).lean();

    // Get review stats for each product
    const productIds = products.map((p) => p._id);
    const reviewStats = await Review.aggregate([
      { $match: { product: { $in: productIds } } },
      {
        $group: {
          _id: "$product",
          averageRating: { $avg: "$rating" },
          numReviews: { $sum: 1 },
        },
      },
    ]);

    // Create a map for quick lookup
    const reviewMap = new Map(
      reviewStats.map((r) => [
        r._id.toString(),
        {
          averageRating: Math.round(r.averageRating * 10) / 10,
          numReviews: r.numReviews,
        },
      ]),
    );

    // Add rating info to each product
    const productsWithRatings = products.map((product) => ({
      ...product,
      averageRating: reviewMap.get(product._id.toString())?.averageRating || 0,
      numReviews: reviewMap.get(product._id.toString())?.numReviews || 0,
    }));

    res.json({ products: productsWithRatings });
  } catch (error) {
    console.log("Error in searchProducts", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get recommended products
// @route   GET /api/products/recommendations
// @access  Public
export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $sample: { size: 4 },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
        },
      },
    ]);

    res.json(products);
  } catch (error) {
    console.log("Error in getRecommendedProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Get review stats
    const reviewStats = await Review.aggregate([
      { $match: { product: product._id } },
      {
        $group: {
          _id: "$product",
          averageRating: { $avg: "$rating" },
          numReviews: { $sum: 1 },
        },
      },
    ]);

    const productWithRating = {
      ...product.toObject(),
      averageRating: reviewStats[0]
        ? Math.round(reviewStats[0].averageRating * 10) / 10
        : 0,
      numReviews: reviewStats[0] ? reviewStats[0].numReviews : 0,
    };

    res.json(productWithRating);
  } catch (error) {
    console.log("Error in getProductById controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
