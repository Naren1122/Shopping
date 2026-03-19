import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
