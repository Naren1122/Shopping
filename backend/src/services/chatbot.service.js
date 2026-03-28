/**
 * Simple help chatbot for Bazar
 * Provides quick answers about common user tasks
 * No AI needed - instant responses
 */

// Common greetings
const greetings = [
  "Hello! 👋 Welcome to Bazar Help! How can I assist you today?",
  "Hi there! 🛍️ Welcome to Bazar! What do you need help with?",
  "Hey! Welcome to Bazar! I'm here to help you navigate the site.",
];

// Quick reply options
export const quickReplies = [
  "Edit Profile",
  "Change Password",
  "Payment Methods",
  "Order Status",
  "Contact Support",
];

/**
 * Get a random greeting
 */
const getGreeting = () => {
  return greetings[Math.floor(Math.random() * greetings.length)];
};

/**
 * Main chatbot response function - simple help chatbot
 * @param {string} message - User's message
 * @returns {Object} - Response with help text and navigation steps
 */
export const getChatbotResponse = async (message) => {
  const lowerMessage = message.toLowerCase().trim();

  // Check for greetings
  if (
    lowerMessage === "hi" ||
    lowerMessage === "hello" ||
    lowerMessage === "hey" ||
    lowerMessage === "start" ||
    lowerMessage === "help" ||
    lowerMessage === "hey" ||
    lowerMessage === "menu"
  ) {
    return {
      success: true,
      message: getGreeting(),
      quickReplies,
    };
  }

  // Edit Profile
  if (
    lowerMessage.includes("edit profile") ||
    lowerMessage.includes("update profile") ||
    lowerMessage.includes("profile") ||
    lowerMessage.includes("change name") ||
    lowerMessage.includes("change phone")
  ) {
    return {
      success: true,
      message:
        "To edit your profile:\n\n" +
        "1. Click on your account icon (top right)\n" +
        "2. Click on 'Profile'\n" +
        "3. Click 'Edit' button\n" +
        "4. Update your name, phone, or other details\n" +
        "5. Click 'Save Changes'\n\n" +
        "Direct link: /profile",
      quickReplies,
    };
  }

  // Change Password
  if (
    lowerMessage.includes("change password") ||
    lowerMessage.includes("reset password") ||
    lowerMessage.includes("password") ||
    lowerMessage.includes("forgot password")
  ) {
    return {
      success: true,
      message:
        "To change your password:\n\n" +
        "1. Go to /login\n" +
        "2. Click 'Forgot Password'\n" +
        "3. Enter your email\n" +
        "4. Check email for reset link",
      quickReplies,
    };
  }

  // Payment Methods
  if (
    lowerMessage.includes("payment") ||
    lowerMessage.includes("esewa") ||
    lowerMessage.includes("pay") ||
    lowerMessage.includes("add card") ||
    lowerMessage.includes("payment method")
  ) {
    return {
      success: true,
      message:
        "About Payments on Bazar:\n\n" +
        "You can either pay via eSewa or cash on delivery.\n\n" +
        "For eSewa payments.\n\n" +
        "During checkout:\n" +
        "1. Add items to cart\n" +
        "2. Go to checkout\n" +
        "3. Select address\n" +
        "4. Choose 'eSewa' as payment\n" +
        "5. Complete payment on eSewa app\n\n" +
        "Your payment is secured!",
      quickReplies,
    };
  }

  // Order Status
  if (
    lowerMessage.includes("order") ||
    lowerMessage.includes("track") ||
    lowerMessage.includes("shipping") ||
    lowerMessage.includes("delivery") ||
    lowerMessage.includes("status")
  ) {
    return {
      success: true,
      message:
        "To check your order status:\n\n" +
        "1. Click on your account icon\n" +
        "2. Click on 'MyOrders'\n" +
        "3. View all your orders\n" +
        "4. Click on an order to see details\n\n" +
        "Direct link: /orders",
      quickReplies,
    };
  }

  // Cart & Checkout
  if (
    lowerMessage.includes("cart") ||
    lowerMessage.includes("checkout") ||
    lowerMessage.includes("buy")
  ) {
    return {
      success: true,
      message:
        "How to buy on Bazar:\n\n" +
        "1. Browse products at /products\n" +
        "2. Click 'Add to Cart' on items\n" +
        "3. Go to /cart\n" +
        "4. Review your items\n" +
        "5. Click 'Proceed to Checkout'\n" +
        "6. Select/Add delivery address\n" +
        "7. Pay via eSewa\n" +
        "8. Order confirmed! 🎉",
      quickReplies,
    };
  }

  // Wishlist
  if (
    lowerMessage.includes("wishlist") ||
    lowerMessage.includes("save") ||
    lowerMessage.includes("favorite")
  ) {
    return {
      success: true,
      message:
        "To save items for later:\n\n" +
        "1. Browse products\n" +
        "2. Click the heart icon ❤️\n" +
        "3. Items saved to wishlist\n" +
        "4. View wishlist at /wishlist\n" +
        "5. Move to cart when ready!",
      quickReplies,
    };
  }

  // Addresses
  if (
    lowerMessage.includes("address") ||
    lowerMessage.includes("delivery address") ||
    lowerMessage.includes("shipping address")
  ) {
    return {
      success: true,
      message:
        "To manage delivery addresses:\n\n" +
        "1. Go to checkout (/checkout/address)\n" +
        "2. Click 'Add New Address'\n" +
        "3. Fill in details\n" +
        "4. Save address\n\n" +
        "You can add multiple addresses!",
      quickReplies,
    };
  }

  // Contact Support
  if (
    lowerMessage.includes("contact") ||
    lowerMessage.includes("support") ||
    lowerMessage.includes("help") ||
    lowerMessage.includes("customer service")
  ) {
    return {
      success: true,
      message:
        "Need help? Contact us:\n\n" +
        "📧 Email: knightkingnaren.123@gmail.com\n\n" +
        "We're happy to assist you!",
      quickReplies,
    };
  }

  // Return/Refund
  if (
    lowerMessage.includes("return") ||
    lowerMessage.includes("refund") ||
    lowerMessage.includes("exchange")
  ) {
    return {
      success: true,
      message:
        "Our Return Policy:\n\n" +
        "• 7-day return window\n" +
        "• Items must be unused\n" +
        "• Original packaging required\n\n" +
        "To request a return:\n" +
        "1. Go to /orders\n" +
        "2. Select your order\n" +
        "3. Click 'Request Return'",
      quickReplies,
    };
  }

  // Thank you
  if (
    lowerMessage.includes("thank") ||
    lowerMessage.includes("thanks") ||
    lowerMessage === "ty"
  ) {
    return {
      success: true,
      message: "You're welcome! 😊 Is there anything else I can help you with?",
      quickReplies,
    };
  }

  // Goodbye
  if (
    lowerMessage.includes("bye") ||
    lowerMessage.includes("goodbye") ||
    lowerMessage.includes("see you")
  ) {
    return {
      success: true,
      message:
        "Goodbye! 👋 Thank you for visiting Bazar. Feel free to come back anytime!",
      quickReplies: [],
    };
  }

  // Default - show menu options
  return {
    success: true,
    message:
      "I can help you with:\n\n" +
      "📝 Edit Profile - Update your details\n" +
      "🔐 Change Password - Secure your account\n" +
      "💳 Payment Methods - Learn about payments\n" +
      "📦 Order Status - Track your orders\n" +
      "🛒 Cart & Checkout - How to buy\n" +
      "❤️ Wishlist - Save items\n" +
      "📍 Addresses - Manage delivery addresses\n" +
      "🔄 Returns - Return policy\n" +
      "📞 Contact - Get support\n\n" +
      "What would you like to know about?",
    quickReplies,
  };
};
