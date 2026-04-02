import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

// Types
export interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: number;
  products?: Product[];
  quickReplies?: string[];
}

interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  quickReplies: string[];
}

const initialState: ChatState = {
  isOpen: false,
  messages: [
    {
      id: "welcome",
      role: "bot",
      content: "Hello! 👋 Welcome to Bazar Help! How can I assist you today?",
      timestamp: Date.now(),
      quickReplies: [
        "Edit Profile",
        "Change Password",
        "Payment Methods",
        "Order Status",
        "Contact Support",
      ],
    },
  ],
  isLoading: false,
  error: null,
  quickReplies: [],
};

// Async thunk for sending message
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (message: string) => {
    const response = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    const data = await response.json();
    return data;
  },
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    },
    openChat: (state) => {
      state.isOpen = true;
    },
    closeChat: (state) => {
      state.isOpen = false;
    },
    clearChat: (state) => {
      state.messages = [
        {
          id: "welcome",
          role: "bot",
          content: "Hello! 👋 Welcome to Bazar! How can I help you today?",
          timestamp: Date.now(),
          quickReplies: [
            "Track my order",
            "Return policy",
            "Contact support",
            "Browse products",
            "Help with checkout",
          ],
        },
      ];
    },
    addQuickReply: (state, action) => {
      const reply = action.payload;
      // Add user message
      state.messages.push({
        id: `user-${Date.now()}`,
        role: "user",
        content: reply,
        timestamp: Date.now(),
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;

        // Add bot response
        state.messages.push({
          id: `bot-${Date.now()}`,
          role: "bot",
          content: action.payload.message,
          timestamp: Date.now(),
          products: action.payload.products,
          quickReplies: action.payload.quickReplies,
        });
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to send message";

        // Add error message
        state.messages.push({
          id: `error-${Date.now()}`,
          role: "bot",
          content: "Sorry, something went wrong. Please try again.",
          timestamp: Date.now(),
        });
      });
  },
});

export const { toggleChat, openChat, closeChat, clearChat, addQuickReply } =
  chatSlice.actions;

export default chatSlice.reducer;
