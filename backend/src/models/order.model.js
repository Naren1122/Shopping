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
      enum: ["pending", "paid", "failed"],
    },
    orderStatus: {
      type: String,
      default: "processing",
      enum: ["processing", "shipped", "delivered", "cancelled"],
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    deliveredAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
