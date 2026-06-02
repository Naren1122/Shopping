import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import API_URL from "@/lib/api";

// Types
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  // Rating fields (optional - populated from reviews)
  averageRating?: number;
  numReviews?: number;
}

interface ProductsState {
  products: Product[];
  featuredProducts: Product[];
  categoryProducts: Product[];
  searchResults: Product[];
  currentProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  pages: number;
}

// Initial state
const initialState: ProductsState = {
  products: [],
  featuredProducts: [],
  categoryProducts: [],
  searchResults: [],
  currentProduct: null,
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  pages: 1,
};

// Helper to get token
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// Async thunks

// Fetch all products (public)
export const fetchAllProducts = createAsyncThunk(
  "products/fetchAll",
  async (
    params: { page?: number; limit?: number } = {},
    { rejectWithValue },
  ) => {
    try {
      const token = getToken();
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());

       const response = await fetch(
         `${API_URL}/products?${queryParams.toString()}`,
         {
           headers: token ? { Authorization: `Bearer ${token}` } : {},
           credentials: "include",
         },
       );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          return rejectWithValue(data.message || "Failed to fetch products");
        }
        return rejectWithValue("Failed to fetch products");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  },
);

// Fetch featured products (public)
export const fetchFeaturedProducts = createAsyncThunk(
  "products/fetchFeatured",
  async (category: string = "", { rejectWithValue, getState }) => {
    try {
      const queryParams = category
        ? `?category=${encodeURIComponent(category)}`
        : "";
       const response = await fetch(
         `${API_URL}/products/featured${queryParams}`,
         {
           credentials: "include",
         },
       );

      if (!response.ok) {
        // Fallback: filter from existing products if API fails
        const state = getState() as { products: ProductsState };
        const featuredFromProducts = state.products.products.filter(
          (p) => p.isFeatured,
        );
        if (featuredFromProducts.length > 0) {
          return featuredFromProducts;
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          return rejectWithValue(data.message || "Failed to fetch featured products");
        }
        return rejectWithValue("Failed to fetch featured products");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Fallback: filter from existing products if API fails
      const state = getState() as { products: ProductsState };
      const featuredFromProducts = state.products.products.filter(
        (p) => p.isFeatured,
      );
      if (featuredFromProducts.length > 0) {
        return featuredFromProducts;
      }
      return rejectWithValue("Network error. Please try again.");
    }
  },
);

// Search products (public) - now supports pagination
export const searchProducts = createAsyncThunk(
  "products/search",
  async (
    params: { query: string; page?: number; limit?: number } | string,
    { rejectWithValue },
  ) => {
    try {
      // Support both string and object params for backward compatibility
      const queryStr = typeof params === "string" ? params : params.query;
      const page = typeof params === "object" ? params.page || 1 : 1;
      const limit = typeof params === "object" ? params.limit || 10 : 10;

       const response = await fetch(
         `${API_URL}/products/search?q=${encodeURIComponent(queryStr)}&page=${page}&limit=${limit}`,
         {
           credentials: "include",
         },
       );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          return rejectWithValue(data.message || "Failed to search products");
        }
        return rejectWithValue("Failed to search products");
      }

      const data = await response.json();
      return data; // Returns { products, page, pages, total }
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  },
);

// Fetch products by category (public)
export const fetchProductsByCategory = createAsyncThunk(
  "products/fetchByCategory",
  async (
    params: { category: string; page?: number; limit?: number },
    { rejectWithValue },
  ) => {
    try {
      const { category, page = 1, limit = 10 } = params;
       const response = await fetch(
         `${API_URL}/products/category/${encodeURIComponent(category)}?page=${page}&limit=${limit}`,
         {
           credentials: "include",
         },
       );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          return rejectWithValue(data.message || "Failed to fetch products");
        }
        return rejectWithValue("Failed to fetch products");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  },
);

// Create product (admin)
export const createProduct = createAsyncThunk(
  "products/create",
  async (
    productData: {
      name: string;
      description: string;
      price: number;
      image: string;
      category: string;
    },
    { rejectWithValue },
  ) => {
    try {
       const token = getToken();
       const response = await fetch(`${API_URL}/products`, {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
           Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify(productData),
         credentials: "include",
       });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          return rejectWithValue(data.message || "Failed to create product");
        }
        return rejectWithValue("Failed to create product");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  },
);

// Delete product (admin)
export const deleteProduct = createAsyncThunk(
  "products/delete",
  async (productId: string, { rejectWithValue }) => {
    try {
       const token = getToken();
       const response = await fetch(
         `${API_URL}/products/${productId}`,
         {
           method: "DELETE",
           headers: {
             Authorization: `Bearer ${token}`,
           },
           credentials: "include",
         },
       );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          return rejectWithValue(data.message || "Failed to delete product");
        }
        return rejectWithValue("Failed to delete product");
      }

      return productId;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  },
);

// Toggle featured (admin)
export const toggleFeatured = createAsyncThunk(
  "products/toggleFeatured",
  async (productId: string, { rejectWithValue }) => {
    try {
       const token = getToken();
       const response = await fetch(
         `${API_URL}/products/${productId}`,
         {
           method: "PATCH",
           headers: {
             Authorization: `Bearer ${token}`,
           },
           credentials: "include",
         },
       );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          return rejectWithValue(data.message || "Failed to update product");
        }
        return rejectWithValue("Failed to update product");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  },
);

// Update product (admin)
export const updateProduct = createAsyncThunk(
  "products/update",
  async (
    {
      productId,
      productData,
    }: { productId: string; productData: Partial<Product> },
    { rejectWithValue },
  ) => {
    try {
       const token = getToken();
       const response = await fetch(
         `${API_URL}/products/${productId}`,
         {
           method: "PUT",
           headers: {
             "Content-Type": "application/json",
             Authorization: `Bearer ${token}`,
           },
           body: JSON.stringify(productData),
         },
       );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          return rejectWithValue(data.message || "Failed to update product");
        }
        return rejectWithValue("Failed to update product");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  },
);

// Fetch single product by ID
export const fetchProductById = createAsyncThunk(
  "products/fetchById",
  async (productId: string, { rejectWithValue }) => {
    try {
      const token = getToken();
       const response = await fetch(
         `${API_URL}/products/${productId}`,
         {
           headers: token ? { Authorization: `Bearer ${token}` } : {},
           credentials: "include",
         },
       );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          return rejectWithValue(data.message || "Failed to fetch product");
        }
        return rejectWithValue("Failed to fetch product");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  },
);

// Products slice
const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentProduct: (state, action: PayloadAction<Product | null>) => {
      state.currentProduct = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all products
      .addCase(fetchAllProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch featured products
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featuredProducts = action.payload;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Search products
      .addCase(searchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle both old format (array) and new format ({ products, page, pages, total })
        if (Array.isArray(action.payload)) {
          state.searchResults = action.payload;
        } else {
          state.searchResults = action.payload.products;
          state.total = action.payload.total;
          state.page = action.payload.page;
          state.pages = action.payload.pages;
        }
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch products by category
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categoryProducts = action.payload.products;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = state.products.filter((p) => p._id !== action.payload);
        state.total -= 1;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Toggle featured
      .addCase(toggleFeatured.fulfilled, (state, action) => {
        const updatedProduct = action.payload;
        const index = state.products.findIndex(
          (p) => p._id === updatedProduct._id,
        );
        if (index !== -1) {
          state.products[index] = updatedProduct;
        }

        // Also update featuredProducts array
        if (updatedProduct.isFeatured) {
          // Add to featured if not already present
          const featuredIndex = state.featuredProducts.findIndex(
            (p) => p._id === updatedProduct._id,
          );
          if (featuredIndex === -1) {
            state.featuredProducts.push(updatedProduct);
          } else {
            state.featuredProducts[featuredIndex] = updatedProduct;
          }
        } else {
          // Remove from featured
          state.featuredProducts = state.featuredProducts.filter(
            (p) => p._id !== updatedProduct._id,
          );
        }
      })
      .addCase(toggleFeatured.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.products.findIndex(
          (p) => p._id === action.payload._id,
        );
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        state.currentProduct = action.payload;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentProduct } = productsSlice.actions;
export default productsSlice.reducer;
