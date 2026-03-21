# Backend Development Roadmap - E-commerce Platform

## Project Overview

This roadmap outlines the complete backend implementation for a full-featured e-commerce platform with eSewa payment integration, order management, and AI recommendations.

---

## Current State

### Existing Files

```
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js     # Authentication
│   │   ├── product.controller.js  # Products
│   │   ├── cart.controller.js    # Shopping Cart
│   │   └── coupon.controller.js  # Coupons
│   ├── models/
│   │   ├── user.model.js
│   │   ├── product.model.js
│   │   └── coupon.model.js
│   ├── routes/
│   │   ├── auth.route.js
│   │   ├── product.route.js
│   │   ├── cart.route.js
│   │   └── coupon.route.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── lib/
│   │   ├── db.js
│   │   ├── redis.js
│   │   ├── cloudinary.js
│   │   └── email.js
│   └── server.js
└── package.json
```

---

## Phase 1: Database Schema Design

### 1.1 Order Model (`backend/src/models/order.model.js`)

```javascript
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: String,
  price: Number,
  quantity: Number,
  image: String,
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
      fullName: String,
      address: String,
      city: String,
      district: String,
      phone: String,
    },
    paymentMethod: {
      type: String,
      enum: ["esewa", "cod"],
      default: "esewa",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentId: String, // eSewa transaction ID
    paymentAmount: Number,
    subtotal: Number,
    discount: Number,
    shippingFee: Number,
    total: Number,
    couponApplied: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
    notes: String,
    estimatedDelivery: Date,
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
```

### 1.2 Address Model (`backend/src/models/address.model.js`)

```javascript
import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    province: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Address", addressSchema);
```

### 1.3 Wishlist Model (`backend/src/models/wishlist.model.js`)

```javascript
import mongoose from "mongoose";

const wishlistItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  addedAt: { type: Date, default: Date.now },
});

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [wishlistItemSchema],
  },
  { timestamps: true },
);

export default mongoose.model("Wishlist", wishlistSchema);
```

### 1.4 Review Model (`backend/src/models/review.model.js`)

```javascript
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 500,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// One review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
```

### 1.5 Payment Model (`backend/src/models/payment.model.js`)

```javascript
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["esewa", "cod"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "NPR",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    transactionId: String, // eSewa transaction ID
    refId: String, // eSewa reference ID
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);

export default mongoose.model("Payment", paymentSchema);
```

---

## Phase 2: Order Management System

### 2.1 API Endpoints

| Method | Endpoint               | Description         | Auth  |
| ------ | ---------------------- | ------------------- | ----- |
| GET    | /api/orders            | Get user's orders   | ✅    |
| GET    | /api/orders/:id        | Get order details   | ✅    |
| POST   | /api/orders            | Create new order    | ✅    |
| PATCH  | /api/orders/:id/status | Update order status | Admin |
| GET    | /api/orders/:id/track  | Track order         | ✅    |

### 2.2 Controller Functions (`backend/src/controllers/order.controller.js`)

```javascript
import Order from "../models/order.model.js";
import Coupon from "../models/coupon.model.js";
import Product from "../models/product.model.js";

export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode } = req.body;

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product not found: ${item.productId}` });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image,
      });

      subtotal += product.price * item.quantity;
    }

    // Apply coupon if provided
    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user._id,
        isActive: true,
      });

      if (coupon && new Date(coupon.expirationDate) > new Date()) {
        discount = (subtotal * coupon.discountPercentage) / 100;
      }
    }

    const shippingFee = subtotal > 1000 ? 0 : 100; // Free shipping over NPR 1000
    const total = subtotal - discount + shippingFee;

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      discount,
      shippingFee,
      total,
      statusHistory: [{ status: "pending", note: "Order placed" }],
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    order.statusHistory.push({ status, note });

    // Update payment status for cancelled orders
    if (status === "cancelled" && order.paymentStatus === "paid") {
      order.paymentStatus = "refunded";
    }

    await order.save();

    // TODO: Send email notification

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

---

## Phase 3: Payment Integration (eSewa)

### 3.1 API Endpoints

| Method | Endpoint                     | Description              | Auth   |
| ------ | ---------------------------- | ------------------------ | ------ |
| POST   | /api/payments/esewa/initiate | Initiate eSewa payment   | ✅     |
| POST   | /api/payments/esewa/verify   | Verify payment           | ✅     |
| POST   | /api/payments/esewa/success  | Payment success callback | Public |
| POST   | /api/payments/esewa/failure  | Payment failure callback | Public |

### 3.2 Controller Functions (`backend/src/controllers/payment.controller.js`)

```javascript
import Order from "../models/order.model.js";
import Payment from "../models/payment.model.js";

const ESEWA_URL = process.env.ESEWA_URL || "https://esewa.com.np/api/epay";
const ESEWA_MERCHANT_ID = process.env.ESEWA_MERCHANT_ID;
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY;

export const initiateEsewaPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Order already paid" });
    }

    // Generate unique product ID
    const productId = `ORDER_${order._id}`;

    // Create payment record
    const payment = await Payment.create({
      user: req.user._id,
      order: order._id,
      paymentMethod: "esewa",
      amount: order.total,
      status: "pending",
    });

    // Generate checksum (hash)
    const checksum = generateChecksum(
      ESEWA_MERCHANT_ID,
      productId,
      order.total,
      order._id.toString(),
    );

    const paymentData = {
      amt: order.total,
      pdc: 0,
      psc: 0,
      txAmt: 0,
      tAmt: order.total,
      pid: productId,
      sid: payment._id,
      su: `${process.env.API_URL}/api/payments/esewa/success`,
      fu: `${process.env.API_URL}/api/payments/esewa/failure`,
    };

    res.json({
      paymentUrl: ESEWA_URL,
      paymentData,
      orderId: order._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyEsewaPayment = async (req, res) => {
  try {
    const { orderId, refId, amount } = req.body;

    // Verify with eSewa API
    const isValid = await verifyWithEsewa(orderId, refId, amount);

    if (!isValid) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Update order and payment status
    const order = await Order.findById(orderId);
    order.paymentStatus = "paid";
    order.paymentId = refId;
    order.status = "confirmed";
    order.statusHistory.push({
      status: "confirmed",
      note: "Payment verified",
    });
    await order.save();

    await Payment.findOneAndUpdate(
      { order: orderId },
      {
        status: "completed",
        transactionId: refId,
        refId,
      },
    );

    // TODO: Send order confirmation email

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const esewaSuccess = async (req, res) => {
  // Handle eSewa redirect on success
  const { refId, status } = req.query;

  if (status === "Complete") {
    // Redirect to frontend success page
    res.redirect(`${process.env.FRONTEND_URL}/order/success?refId=${refId}`);
  } else {
    res.redirect(`${process.env.FRONTEND_URL}/order/failure`);
  }
};

export const esewaFailure = async (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/order/failure`);
};

// Helper function to generate checksum
function generateChecksum(merchantId, productId, amount, orderId) {
  // Implement eSewa checksum generation
  const data = `total_amount=${amount},product_identity=${productId},product_service_charge=0,product_delivery_charge=0,tax_amount=0,secret_key=${ESEWA_SECRET_KEY}`;
  return require("crypto").createHash("sha256").update(data).digest("hex");
}

// Helper function to verify with eSewa
async function verifyWithEsewa(orderId, refId, amount) {
  // Implement eSewa verification API call
  return true; // Placeholder
}
```

---

## Phase 4: Address Management

### 4.1 API Endpoints

| Method | Endpoint                   | Description       | Auth |
| ------ | -------------------------- | ----------------- | ---- |
| GET    | /api/addresses             | Get all addresses | ✅   |
| POST   | /api/addresses             | Add new address   | ✅   |
| PUT    | /api/addresses/:id         | Update address    | ✅   |
| DELETE | /api/addresses/:id         | Delete address    | ✅   |
| PATCH  | /api/addresses/:id/default | Set default       | ✅   |

---

## Phase 5: Wishlist Feature

### 5.1 API Endpoints

| Method | Endpoint                 | Description          | Auth |
| ------ | ------------------------ | -------------------- | ---- |
| GET    | /api/wishlist            | Get wishlist         | ✅   |
| POST   | /api/wishlist            | Add to wishlist      | ✅   |
| DELETE | /api/wishlist/:productId | Remove from wishlist | ✅   |

---

## Phase 6: Reviews & Ratings

### 6.1 API Endpoints

| Method | Endpoint                               | Description         | Auth   |
| ------ | -------------------------------------- | ------------------- | ------ |
| GET    | /api/reviews/product/:productId        | Get product reviews | Public |
| POST   | /api/reviews                           | Create review       | ✅     |
| GET    | /api/reviews/product/:productId/rating | Get average rating  | Public |

---

## Phase 7: Search & Pagination

### 7.1 Updated Product Endpoints

| Method | Endpoint                        | Description              |
| ------ | ------------------------------- | ------------------------ |
| GET    | /api/products?page=1&limit=10   | Paginated products       |
| GET    | /api/products/search?q=query    | Search products          |
| GET    | /api/products?category=x&page=1 | Category with pagination |

---

## Phase 8: AI Recommendations (Gemini API)

### 8.1 API Endpoints

| Method | Endpoint             | Description            | Auth |
| ------ | -------------------- | ---------------------- | ---- |
| GET    | /api/recommendations | Get AI recommendations | ✅   |

### 8.2 Controller (`backend/src/controllers/recommendation.controller.js`)

```javascript
import axios from "axios";

export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user purchase history and cart
    const user = await User.findById(userId).populate("cartItems.product");
    const orders = await Order.find({ user: userId });

    // Build user profile for AI
    const userProfile = {
      purchaseHistory: orders.flatMap((o) => o.orderItems.map((i) => i.name)),
      cartItems: user.cartItems.map((i) => ({
        name: i.product?.name,
        category: i.product?.category,
      })),
      preferences: orders.length > 0 ? orders[0].orderItems[0]?.category : null,
    };

    // Call Gemini API
    const prompt = `Based on user preferences: ${JSON.stringify(userProfile)}, 
      recommend 5 products from this catalog. Return as JSON array with 
      product names and brief reasons.`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { params: { key: process.env.GEMINI_API_KEY } },
    );

    // Parse and return recommendations
    // In production, match recommendations to actual products

    // Cache in Redis for 1 hour
    await redis.setex(
      `recommendations:${userId}`,
      3600,
      JSON.stringify(recommendations),
    );

    res.json(recommendations);
  } catch (error) {
    // Fallback to category-based recommendations
    const fallback = await Product.aggregate([{ $sample: { size: 5 } }]);
    res.json(fallback);
  }
};
```

---

## Phase 9: Analytics (Admin)

### 9.1 API Endpoints

| Method | Endpoint                | Description     | Auth  |
| ------ | ----------------------- | --------------- | ----- |
| GET    | /api/analytics/overview | Dashboard stats | Admin |
| GET    | /api/analytics/sales    | Sales data      | Admin |
| GET    | /api/analytics/orders   | Order analytics | Admin |

---

## Phase 10: Email Notifications

### 10.1 Email Templates

- Order Confirmation
- Payment Received
- Order Shipped
- Order Delivered
- Order Cancelled

---

## Environment Variables Required

```env
# Server
PORT=5001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/bazar

# Redis
REDIS_URL=your_upstash_redis_url

# JWT
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_app_password

# eSewa (Nepal Payment Gateway)
ESEWA_MERCHANT_ID=your_merchant_id
ESEWA_SECRET_KEY=your_secret_key
ESEWA_URL=https://esewa.com.np/api/epay

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# URLs
API_URL=http://localhost:5001
FRONTEND_URL=http://localhost:3000
```

---

## Integration Points

### Existing Modules Integration

1. **Auth** - Use existing JWT middleware
2. **Cart** - Clear cart after order creation
3. **Products** - Use existing product data
4. **Coupons** - Apply existing coupon logic
5. **Redis** - Cache recommendations, product listings
6. **Email** - Send order notifications

### Checkout Flow

```
1. User reviews cart items
2. Selects/creates shipping address
3. Applies coupon (optional)
4. Selects payment method (eSewa/COD)
5. Confirms order
6. If eSewa: Redirect to eSewa → Verify → Create Order
7. If COD: Create Order directly
8. Send confirmation email
9. Clear cart
10. Show order confirmation
```
