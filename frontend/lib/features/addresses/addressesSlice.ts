import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Types
export interface Address {
  _id: string;
  user: string;
  address: string;
  city: string;
  district: string;
  province: string;
  ward: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AddressState {
  addresses: Address[];
  selectedAddress: Address | null;
  isLoading: boolean;
  error: string | null;
}

interface AddressFormData {
  address: string;
  city: string;
  district: string;
  province: string;
  ward: string;
  phone: string;
  isDefault?: boolean;
}

export type { AddressFormData };

// Initial state
const initialState: AddressState = {
  addresses: [],
  selectedAddress: null,
  isLoading: false,
  error: null,
};

// API base URL
const API_URL = "http://localhost:5000/api/addresses";

// Helper to get token
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// Async thunks
export const fetchAddresses = createAsyncThunk(
  "addresses/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue("No token found");
      }

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch addresses");
      }

      return data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  },
);

export const addAddress = createAsyncThunk(
  "addresses/add",
  async (addressData: AddressFormData, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue("No token found");
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressData),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to add address");
      }

      return data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  },
);

export const updateAddress = createAsyncThunk(
  "addresses/update",
  async (
    { id, addressData }: { id: string; addressData: AddressFormData },
    { rejectWithValue },
  ) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue("No token found");
      }

      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressData),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to update address");
      }

      return data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  },
);

export const deleteAddress = createAsyncThunk(
  "addresses/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue("No token found");
      }

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to delete address");
      }

      return id;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  },
);

export const setDefaultAddress = createAsyncThunk(
  "addresses/setDefault",
  async (id: string, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue("No token found");
      }

      const response = await fetch(`${API_URL}/${id}/default`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to set default address");
      }

      return data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  },
);

// Address slice
const addressSlice = createSlice({
  name: "addresses",
  initialState,
  reducers: {
    setSelectedAddress: (state, action: PayloadAction<Address | null>) => {
      state.selectedAddress = action.payload;
    },
    clearAddressError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all addresses
      .addCase(fetchAddresses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addresses = action.payload;
        // Set selected address to default if exists
        const defaultAddress = action.payload.find(
          (addr: Address) => addr.isDefault,
        );
        if (defaultAddress) {
          state.selectedAddress = defaultAddress;
        } else if (action.payload.length > 0 && !state.selectedAddress) {
          state.selectedAddress = action.payload[0];
        }
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add address
      .addCase(addAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addresses.unshift(action.payload);
        if (action.payload.isDefault) {
          state.addresses = state.addresses.map((addr) =>
            addr._id === action.payload._id
              ? action.payload
              : { ...addr, isDefault: false },
          );
        }
        if (!state.selectedAddress) {
          state.selectedAddress = action.payload;
        }
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update address
      .addCase(updateAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.addresses.findIndex(
          (addr) => addr._id === action.payload._id,
        );
        if (index !== -1) {
          state.addresses[index] = action.payload;
        }
        if (state.selectedAddress?._id === action.payload._id) {
          state.selectedAddress = action.payload;
        }
        // Update default status
        if (action.payload.isDefault) {
          state.addresses = state.addresses.map((addr) =>
            addr._id === action.payload._id
              ? action.payload
              : { ...addr, isDefault: false },
          );
        }
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete address
      .addCase(deleteAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addresses = state.addresses.filter(
          (addr) => addr._id !== action.payload,
        );
        if (state.selectedAddress?._id === action.payload) {
          state.selectedAddress =
            state.addresses.length > 0 ? state.addresses[0] : null;
        }
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Set default address
      .addCase(setDefaultAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addresses = state.addresses.map((addr) =>
          addr._id === action.payload._id
            ? { ...action.payload, isDefault: true }
            : { ...addr, isDefault: false },
        );
        state.selectedAddress = action.payload;
      })
      .addCase(setDefaultAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedAddress, clearAddressError } = addressSlice.actions;
export default addressSlice.reducer;
