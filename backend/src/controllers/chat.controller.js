import {
  getChatbotResponse,
  quickReplies,
} from "../services/chatbot.service.js";

/**
 * Handle chatbot message
 * POST /api/chat
 */
export const handleChatMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Please provide a message",
      });
    }

    // Get response from chatbot service (instant - no API calls)
    const response = await getChatbotResponse(message);

    res.json(response);
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

/**
 * Get quick reply options
 * GET /api/chat/quick-replies
 */
export const getQuickReplies = async (req, res) => {
  try {
    res.json({
      success: true,
      quickReplies,
    });
  } catch (error) {
    console.error("Error getting quick replies:", error);
    res.status(500).json({
      success: false,
      quickReplies: [],
    });
  }
};
