import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Types
export interface WishlistItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isFeatured: boolean;
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: WishlistState = {
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

// Get wishlist
export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      const response = await fetch("http://localhost:5000/api/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch wishlist");
      }

      return data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  },
);

// Add to wishlist
export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async (productId: string, { rejectWithValue }) => {
    try {
      const token = getToken();
      const response = await fetch("http://localhost:5000/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to add to wishlist");
      }

      return data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  },
);

// Remove from wishlist
export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (productId: string, { rejectWithValue }) => {
    try {
      const token = getToken();
      console.log("removeFromWishlist: Token:", token ? "exists" : "null");
      console.log("removeFromWishlist: Product ID:", productId);

      const response = await fetch(
        `http://localhost:5000/api/wishlist/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        },
      );

      console.log("removeFromWishlist: Response status:", response.status);

      const data = await response.json();
      console.log("removeFromWishlist: Response data:", data);

      if (!response.ok) {
        return rejectWithValue(
          data.message || "Failed to remove from wishlist",
        );
      }

      return data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  },
);

// Wishlist slice
const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlistError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add to wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Remove from wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearWishlistError } = wishlistSlice.actions;
export default wishlistSlice.reducer;
