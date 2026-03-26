import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import productsReducer from "./features/products/productsSlice";
import cartReducer from "./features/cart/cartSlice";
import wishlistReducer from "./features/wishlist/wishlistSlice";
import addressesReducer from "./features/addresses/addressesSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      products: productsReducer,
      cart: cartReducer,
      wishlist: wishlistReducer,
      addresses: addressesReducer,
    },
  });
};

// Type for the store
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
