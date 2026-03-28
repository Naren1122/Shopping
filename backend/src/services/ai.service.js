import Product from "../models/product.model.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Using v1 API with gemini-1.5-flash model
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY || ""}`;

// Check if API key is configured
const isAIConfigured = () => {
  return GEMINI_API_KEY && GEMINI_API_KEY.length > 0;
};

/**
 * Get AI-powered product recommendations
 * @param {Object} userContext - User's browsing/purchase history
 * @returns {Array} - Array of recommended products with reasons
 */
export const getRecommendations = async (userContext) => {
  try {
    // Check if AI is configured
    if (!isAIConfigured()) {
      // Return fallback products without AI
      const products = await Product.find({}).lean();
      return products
        .sort(() => 0.5 - Math.random())
        .slice(0, 5)
        .map((p) => ({
          productId: p._id,
          reason: "Popular product",
          product: p,
        }));
    }

    // Get all products from database
    const products = await Product.find({}).lean();

    if (products.length === 0) {
      return { recommendations: [], message: "No products available" };
    }

    // Prepare product list for AI
    const productList = products
      .slice(0, 20) // Limit to 20 products for prompt
      .map(
        (p) =>
          `- ${p.name} (${p.category}): Rs. ${p.price} - ${p.description?.slice(0, 50)}...`,
      )
      .join("\n");

    // Build prompt for Gemini
    const prompt = `
You are a product recommendation system for an e-commerce store.
Based on the user's context, recommend the most relevant products.

User Context:
- Browsing history (products viewed): ${userContext.browsingHistory?.join(", ") || "None"}
- Browsing categories (categories user viewed): ${userContext.browsingCategories?.join(", ") || "None"}
- Purchased categories (categories user bought before): ${userContext.purchases?.join(", ") || "None"}
- Wishlist items: ${userContext.wishlist?.join(", ") || "None"}
- Cart items: ${userContext.cartItems?.join(", ") || "None"}

Available Products:
${productList}

Task: Return exactly 5 product recommendations in this JSON format:
{
  "recommendations": [
    { "productId": "product_id", "reason": "brief reason why this is recommended" }
  ]
}

Only return valid JSON, no other text.
    `;

    // Call Gemini API
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }),
    });

    const data = await response.json();

    // Parse the AI response
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Extract JSON from response
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const recommendations = JSON.parse(jsonMatch[0]);

      // Enrich with actual product data
      const enrichedRecommendations = recommendations.recommendations
        .map((rec) => {
          const product = products.find(
            (p) => p._id.toString() === rec.productId,
          );
          return {
            ...rec,
            product: product || null,
          };
        })
        .filter((r) => r.product);

      return enrichedRecommendations;
    }

    // Fallback: Return random products if AI fails
    const fallback = products
      .sort(() => 0.5 - Math.random())
      .slice(0, 5)
      .map((p) => ({
        productId: p._id,
        reason: "Popular product",
        product: p,
      }));

    return fallback;
  } catch (error) {
    console.error("AI Recommendation Error:", error.message);

    // Return fallback products on error
    const products = await Product.find({}).lean();
    return products
      .sort(() => 0.5 - Math.random())
      .slice(0, 5)
      .map((p) => ({
        productId: p._id,
        reason: "Trending product",
        product: p,
      }));
  }
};

/**
 * Get personalized product suggestions based on category
 * @param {string} category - Product category
 * @returns {Array} - Array of products in that category
 */
export const getSimilarProducts = async (productId) => {
  try {
    const product = await Product.findById(productId);

    if (!product) {
      return [];
    }

    // Find products in same category
    const similarProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    }).limit(5);

    return similarProducts;
  } catch (error) {
    console.error("Similar Products Error:", error.message);
    return [];
  }
};
