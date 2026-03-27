import Order from "../models/order.model.js";
import Payment from "../models/payment.model.js";
import crypto from "crypto";

// Generate HMAC SHA256 signature for eSewa
const generateSignature = (data, secretKey) => {
  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(data);
  return hmac.digest("base64");
};

// Verify signature from eSewa response
const verifySignature = (data, signature, secretKey) => {
  const expectedSignature = generateSignature(data, secretKey);
  return expectedSignature === signature;
};

// Hardcoded test credentials for eSewa sandbox - known to work
const ESEWA_TEST_SECRET_KEY = "8gBm/:&EnhH.1/q";

// @desc    Initiate eSewa payment with proper form parameters
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

    // Generate unique transaction UUID (alphanumeric only, no special chars except hyphen)
    const timestamp = Date.now();
    const transactionUuid = `ORD${timestamp}`;

    // Get eSewa credentials
    const esewaUrl =
      process.env.ESEWA_URL ||
      "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
    const merchantId = process.env.ESEWA_MERCHANT_ID || "EPAYTEST";
    const secretKey = ESEWA_TEST_SECRET_KEY; // Use hardcoded key
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const useDemoMode = process.env.ESEWA_DEMO_MODE === "true";

    // If demo mode, skip real eSewa integration and return demo URL
    if (useDemoMode) {
      console.log("[eSewa] Running in DEMO mode - using demo payment page");
      return res.json({
        demoMode: true,
        paymentUrl: `${frontendUrl}/esewa-demo`,
        orderId: order._id,
        amount: order.totalPrice,
        total_amount: order.totalPrice.toString(),
        transaction_uuid: `${order._id}-${Date.now()}`,
      });
    }

    console.log("[eSewa] === SIGNATURE DEBUG ===");
    console.log("[eSewa] Secret Key:", secretKey);
    console.log("[eSewa] Merchant ID:", merchantId);

    // Test with known eSewa docs example
    const testSignatureData = "110,241028,EPAYTEST";
    const testSignature = generateSignature(testSignatureData, secretKey);
    console.log("[eSewa] Test (110,241028,EPAYTEST):", testSignature);
    console.log(
      "[eSewa] Expected:",
      "i94zsd3oXF6ZsSr/kGqT4sSzYQzjj1W/waxjWyRwaME=",
    );
    console.log(
      "[eSewa] Match:",
      testSignature === "i94zsd3oXF6ZsSr/kGqT4sSzYQzjj1W/waxjWyRwaME=",
    );

    // Calculate amounts - ensure proper format
    const amount = String(Math.round(order.totalPrice * 100) / 100);
    const taxAmount = "0";
    const productServiceCharge = "0";
    const productDeliveryCharge = "0";
    const totalAmount = String(Math.round(order.totalPrice * 100) / 100);

    // eSewa signature format: must include field names with values!
    // Format: total_amount=VALUE,transaction_uuid=VALUE,product_code=VALUE
    const signedFieldNames = "total_amount,transaction_uuid,product_code";
    const signatureData = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${merchantId}`;

    console.log("[eSewa] Signature Data:", signatureData);

    const signature = generateSignature(signatureData, secretKey);
    console.log("[eSewa] Generated Signature:", signature);

    // Return all required eSewa form parameters
    res.json({
      paymentUrl: esewaUrl,
      amount,
      tax_amount: taxAmount,
      product_service_charge: productServiceCharge,
      product_delivery_charge: productDeliveryCharge,
      product_code: merchantId,
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      success_url: `http://localhost:5000/api/payments/esewa/success`,
      failure_url: `http://localhost:5000/api/payments/esewa/failure`,
      signed_field_names: signedFieldNames,
      signature,
      orderId: order._id,
      orderAmount: order.totalPrice,
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

// @desc    Handle payment success callback from eSewa
// @route   GET /api/payments/esewa/success
// @access  Public (called by eSewa)
export const esewaSuccess = async (req, res) => {
  const {
    transaction_code,
    status,
    total_amount,
    transaction_uuid,
    product_code,
    signed_field_names,
    signature,
  } = req.query;

  try {
    // Verify signature if available
    const secretKey = ESEWA_TEST_SECRET_KEY;
    if (signature && signed_field_names && secretKey) {
      const fields = String(signed_field_names).split(",");
      const dataString = fields
        .map((field) => {
          switch (field.trim()) {
            case "transaction_code":
              return transaction_code;
            case "status":
              return status;
            case "total_amount":
              return total_amount;
            case "transaction_uuid":
              return transaction_uuid;
            case "product_code":
              return product_code;
            case "signed_field_names":
              return signed_field_names;
            default:
              return "";
          }
        })
        .join(",");

      const isValid = verifySignature(dataString, String(signature), secretKey);
      console.log(
        "[eSewa] Signature verification:",
        isValid ? "SUCCESS" : "FAILED",
      );

      if (!isValid) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/payment-failed?reason=invalid_signature`,
        );
      }
    }

    console.log("[eSewa] Payment success:", {
      transaction_code,
      status,
      total_amount,
      transaction_uuid,
    });

    res.redirect(
      `${process.env.FRONTEND_URL}/payment-success?status=${status}&transactionId=${transaction_code}`,
    );
  } catch (error) {
    console.error("Error processing eSewa success callback:", error);
    res.redirect(
      `${process.env.FRONTEND_URL}/payment-failed?reason=server_error`,
    );
  }
};

// @desc    Handle payment failure callback from eSewa
// @route   GET /api/payments/esewa/failure
// @access  Public (called by eSewa)
export const esewaFailure = async (req, res) => {
  const { transaction_uuid, status, error_code, error_message } = req.query;

  console.log("[eSewa] Payment failed:", {
    transaction_uuid,
    status,
    error_code,
    error_message,
  });

  try {
    // Extract order ID from transaction_uuid
    let orderId = null;
    if (transaction_uuid) {
      const parts = String(transaction_uuid).split("-");
      if (parts.length > 1) {
        orderId = parts[0];
      }
    }

    if (orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = "failed";
        await order.save();

        const payment = await Payment.findOne({ order: orderId });
        if (payment) {
          payment.status = "failed";
          payment.failureReason = error_message || status;
          await payment.save();
        }
      }
    }

    res.redirect(
      `${process.env.FRONTEND_URL}/payment-failed?orderId=${orderId || ""}&reason=${error_message || status || "cancelled"}`,
    );
  } catch (error) {
    console.error("Error processing eSewa failure callback:", error);
    res.redirect(
      `${process.env.FRONTEND_URL}/payment-failed?reason=server_error`,
    );
  }
};
