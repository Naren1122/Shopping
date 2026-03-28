import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Types
interface Product {
  _id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  category: string;
  stock: number;
}

interface Recommendation {
  productId: string;
  reason: string;
  product: Product;
}

interface RecommendationsState {
  recommendations: Recommendation[];
  isLoading: boolean;
  error: string | null;
}

const initialState: RecommendationsState = {
  recommendations: [],
  isLoading: false,
  error: null,
};

// Get auth token
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// Async thunks
export const fetchRecommendations = createAsyncThunk(
  "recommendations/fetchRecommendations",
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue("Not authenticated");
      }

      const response = await fetch("http://localhost:5000/api/recommendations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch recommendations");
      }

      return data.recommendations;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  },
);

// Recommendations slice
const recommendationsSlice = createSlice({
  name: "recommendations",
  initialState,
  reducers: {
    clearRecommendations: (state) => {
      state.recommendations = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch recommendations
      .addCase(fetchRecommendations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recommendations = action.payload;
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearRecommendations } = recommendationsSlice.actions;
export default recommendationsSlice.reducer;