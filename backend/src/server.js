import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import addressRoutes from "./routes/address.route.js";
import wishlistRoutes from "./routes/wishlist.route.js";
import reviewRoutes from "./routes/review.route.js";
import orderRoutes from "./routes/order.route.js";
import paymentRoutes from "./routes/payment.route.js";



dotenv.config({ path: "./src/.env" });
const app = express();
connectDB();
const PORT = process.env.PORT || 5001;

app.use(express.json({ limit: "10mb" })); // allows us to parse incoming requests with JSON payloads

app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
