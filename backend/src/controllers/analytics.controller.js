import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

/**
 * Get overview analytics
 * @route GET /api/analytics/overview
 * @access Admin only
 */
export const getOverview = async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();

    // Get total revenue (sum of all delivered order totals)
    const revenueResult = await Order.aggregate([
      {
        $match: { 
          orderStatus: "delivered",
          paymentStatus: "paid"
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Get today's orders (delivered)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today },
      orderStatus: "delivered",
    });

    // Get today's revenue (delivered orders)
    const todayRevenueResult = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: today },
          orderStatus: "delivered",
          paymentStatus: "paid"
        }
      },
      {
        $group: {
          _id: null,
          todayRevenue: { $sum: "$totalPrice" },
        },
      },
    ]);
    const todayRevenue = todayRevenueResult[0]?.todayRevenue || 0;

    res.json({
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue,
      todayOrders,
      todayRevenue,
    });
  } catch (error) {
    console.error("Error in getOverview:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get sales analytics by period
 * @route GET /api/analytics/sales
 * @access Admin only
 */
export const getSalesAnalytics = async (req, res) => {
  try {
    const { period = "week" } = req.query;

    let startDate = new Date();

    // Calculate start date based on period
    if (period === "day") {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === "week") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === "month") {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === "year") {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: "paid",
          orderStatus: "delivered",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      period,
      salesData,
    });
  } catch (error) {
    console.error("Error in getSalesAnalytics:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get order status breakdown
 * @route GET /api/analytics/orders
 * @access Admin only
 */
export const getOrderAnalytics = async (req, res) => {
  try {
    const orderStatusBreakdown = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format response
    const statusCounts = {};
    orderStatusBreakdown.forEach((item) => {
      statusCounts[item._id] = item.count;
    });

    res.json({
      statusCounts,
      total: orderStatusBreakdown.reduce((sum, item) => sum + item.count, 0),
    });
  } catch (error) {
    console.error("Error in getOrderAnalytics:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get top selling products
 * @route GET /api/analytics/top-products
 * @access Admin only
 */
export const getTopProducts = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $match: { paymentStatus: "paid", orderStatus: "delivered" } },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          totalSold: { $sum: "$orderItems.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] },
          },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          productId: "$_id",
          name: "$product.name",
          image: "$product.image",
          totalSold: 1,
          totalRevenue: 1,
        },
      },
    ]);

    res.json(topProducts);
  } catch (error) {
    console.error("Error in getTopProducts:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
