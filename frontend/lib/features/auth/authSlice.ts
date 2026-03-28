import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Types
interface User {
  id: string;
  email: string;
  name: string;
  role: "customer" | "admin";
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  adminSecretKey?: string;
}

// API base URL for backend
const API_URL = "http://localhost:5000/api/auth";

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Login failed");
      }

      return data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  },
);

export const signup = createAsyncThunk(
  "auth/signup",
  async (credentials: SignupCredentials, { rejectWithValue }) => {
    try {
      // Only send adminSecretKey if provided
      const payload = {
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
        ...(credentials.adminSecretKey && {
          adminSecretKey: credentials.adminSecretKey,
        }),
      };

      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Signup failed");
      }

      return data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  },
);

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    // Call backend logout endpoint to clear cookies
    await fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    // Continue with local cleanup even if backend call fails
    console.error("Backend logout failed:", error);
  }

  // Clear local storage and cookies
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie =
      "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }
  return null;
});

export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        return rejectWithValue("No token found");
      }

      const response = await fetch("http://localhost:5000/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch profile");
      }

      return data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  },
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (
    profileData: { name?: string; email?: string },
    { rejectWithValue },
  ) => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        return rejectWithValue("No token found");
      }

      const response = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to update profile");
      }

      return data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  },
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>,
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },
    initializeAuth: (
      state,
      action: PayloadAction<{ user: User; token: string }>,
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        // Backend returns: { _id, name, email, role, token }
        const userData = {
          id: action.payload._id,
          email: action.payload.email,
          name: action.payload.name,
          role: action.payload.role,
        };
        state.user = userData;
        // Save user and token to localStorage for persistence
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(userData));
          if (action.payload.token) {
            localStorage.setItem("token", action.payload.token);
          }
        }
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Signup
      .addCase(signup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        // Backend returns: { _id, name, email, role, message, token }
        const userData = {
          id: action.payload._id,
          email: action.payload.email,
          name: action.payload.name,
          role: action.payload.role,
        };
        state.user = userData;
        // Save user and token to localStorage for persistence
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(userData));
          if (action.payload.token) {
            localStorage.setItem("token", action.payload.token);
          }
        }
        state.token = action.payload.token;
      })
      .addCase(signup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = {
          id: action.payload._id,
          email: action.payload.email,
          name: action.payload.name,
          role: action.payload.role,
        };
        // Update localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(state.user));
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCredentials, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
