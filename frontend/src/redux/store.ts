import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import sellerAuthReducer from "./sellerAuthSlice";
import cartReducer from "./cartSlice";
import { AUTH_STORAGE_KEY, SELLER_AUTH_STORAGE_KEY } from "@/Common/lib/api";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    sellerAuth: sellerAuthReducer,
    cart: cartReducer
  }
});

// Mirror auth state into sessionStorage on every change so a page reload (and
// Common/lib/api.ts's interceptor, which reads storage directly to avoid importing the store)
// picks up the latest token without an extra round trip. The seller session is mirrored to its
// own storage key so it never collides with the customer/admin session above.
store.subscribe(() => {
  const { auth, sellerAuth } = store.getState();
  try {
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    sessionStorage.setItem(SELLER_AUTH_STORAGE_KEY, JSON.stringify(sellerAuth));
  } catch {
    /* storage unavailable (private mode, quota) — session just won't survive a reload */
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
