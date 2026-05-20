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
      province: String,
      ward: String,
      phone: String,
    },
    paymentMethod: {
      type: String,
      default: "cod", // cash on delivery
    },
    paymentStatus: {
      type: String,
      default: "pending",
      enum: ["pending", "paid", "failed", "refunded"],
    },
    orderStatus: {
      type: String,
      default: "pending",
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    deliveredAt: {
      type: Date,
    },
    // Cancellation fields
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
    },
    cancelledBy: {
      type: String,
      enum: ["user", "admin"],
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundStatus: {
      type: String,
      default: "none",
      enum: ["none", "requested", "processing", "completed", "rejected"],
    },
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
