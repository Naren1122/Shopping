import Order from "../models/order.model.js";
import Payment from "../models/payment.model.js";

// @desc    Initiate eSewa payment
// @route   POST /api/payments/esewa/initiate
// @access  Private
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

    // Create payment record
    const payment = await Payment.create({
      user: req.user._id,
      order: order._id,
      paymentMethod: "esewa",
      amount: order.totalPrice,
      status: "pending",
    });

    // Generate product ID for eSewa
    const productId = `ORDER_${order._id}`;

    // Build eSewa payment URL
    const esewaUrl = process.env.ESEWA_URL;
    const merchantId = process.env.ESEWA_MERCHANT_ID;

    res.json({
      paymentUrl: esewaUrl,
      orderId: order._id,
      amount: order.totalPrice,
      productId: productId,
      merchantId: merchantId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify eSewa payment
// @route   POST /api/payments/esewa/verify
// @access  Private
export const verifyEsewaPayment = async (req, res) => {
  try {
    const { orderId, refId, transactionId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // In production, verify checksum with eSewa server
    // For dev, we just mark as paid

    // Update payment status
    const payment = await Payment.findOne({ order: orderId });
    if (payment) {
      payment.status = "completed";
      payment.transactionId = transactionId;
      payment.refId = refId;
      await payment.save();
    }

    // Update order status
    order.paymentStatus = "paid";
    order.paymentMethod = "esewa";
    await order.save();

    res.json({ message: "Payment verified successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Handle payment success callback
// @route   GET /api/payments/esewa/success
// @access  Public
export const esewaSuccess = async (req, res) => {
  const { orderId, refId, transactionId } = req.query;

  try {
    const order = await Order.findById(orderId);
    if (order) {
      order.paymentStatus = "paid";
      order.paymentMethod = "esewa";
      await order.save();

      const payment = await Payment.findOne({ order: orderId });
      if (payment) {
        payment.status = "completed";
        payment.transactionId = transactionId;
        payment.refId = refId;
        await payment.save();
      }
    }

    res.redirect(
      `${process.env.FRONTEND_URL}/payment-success?orderId=${orderId}`,
    );
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
  }
};

// @desc    Handle payment failure callback
// @route   GET /api/payments/esewa/failure
// @access  Public
export const esewaFailure = async (req, res) => {
  const { orderId } = req.query;

  try {
    const order = await Order.findById(orderId);
    if (order) {
      order.paymentStatus = "failed";
      await order.save();
    }

    res.redirect(
      `${process.env.FRONTEND_URL}/payment-failed?orderId=${orderId}`,
    );
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
  }
};
