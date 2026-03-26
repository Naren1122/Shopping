import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Types
export interface CartItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: CartState = {
  items: [],
  isLoading: false,
  error: null,
};

// Helper to get token
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// Async thunks

// Get cart items
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();

      // Check if token exists
      if (!token) {
        return rejectWithValue("Please login to view cart");
      }

      const response = await fetch("http://localhost:5000/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch cart");
      }

      return data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  },
);

// Add to cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (
    { productId, quantity }: { productId: string; quantity: number },
    { rejectWithValue },
  ) => {
    try {
      const token = getToken();

      // Check if token exists
      if (!token) {
        return rejectWithValue("Please login to add items to cart");
      }

      const response = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to add to cart");
      }

      return data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  },
);

// Remove from cart
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (productId: string, { rejectWithValue }) => {
    try {
      const token = getToken();

      // Check if token exists
      if (!token) {
        return rejectWithValue("Please login to manage cart");
      }

      const response = await fetch("http://localhost:5000/api/cart", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to remove from cart");
      }

      return data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  },
);

// Update cart item quantity
export const updateCartQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async (
    { productId, quantity }: { productId: string; quantity: number },
    { rejectWithValue },
  ) => {
    try {
      const token = getToken();

      // Check if token exists
      if (!token) {
        return rejectWithValue("Please login to update cart");
      }

      const response = await fetch(
        `http://localhost:5000/api/cart/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity }),
          credentials: "include",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to update quantity");
      }

      return data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  },
);

// Cart slice
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        const error = action.payload as string;
        state.error = error;
        // If token is expired, clear auth state and redirect to login
        if (error && error.includes("expired")) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.dispatchEvent(new Event("auth:logout"));
            window.location.href = "/login?expired=true";
          }
        }
      })
      // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        const error = action.payload as string;
        state.error = error;
        // If token is expired, clear auth state and redirect to login
        if (error && error.includes("expired")) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // Dispatch a custom event to clear auth state
            window.dispatchEvent(new Event("auth:logout"));
            // Redirect to login
            window.location.href = "/login?expired=true";
          }
        }
      })
      // Remove from cart
      .addCase(removeFromCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isLoading = false;
        const error = action.payload as string;
        state.error = error;
        // If token is expired, clear auth state
        if (error && error.includes("expired")) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.dispatchEvent(new Event("auth:logout"));
            window.location.href = "/login?expired=true";
          }
        }
      })
      // Update quantity
      .addCase(updateCartQuantity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.isLoading = false;
        const error = action.payload as string;
        state.error = error;
        // If token is expired, clear auth state
        if (error && error.includes("expired")) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.dispatchEvent(new Event("auth:logout"));
            window.location.href = "/login?expired=true";
          }
        }
      });
  },
});

export const { clearCartError } = cartSlice.actions;
export default cartSlice.reducer;
