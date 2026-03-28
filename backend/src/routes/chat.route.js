import express from "express";
import {
  handleChatMessage,
  getQuickReplies,
} from "../controllers/chat.controller.js";

const router = express.Router();

// POST /api/chat - Send a message to the chatbot
router.post("/", handleChatMessage);

// GET /api/chat/quick-replies - Get quick reply options
router.get("/quick-replies", getQuickReplies);

export default router;
