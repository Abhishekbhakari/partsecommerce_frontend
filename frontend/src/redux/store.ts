import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import cartReducer from "./cartSlice";
import { AUTH_STORAGE_KEY } from "@/Common/lib/api";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer
  }
});

// Mirror auth state into sessionStorage on every change so a page reload (and
// Common/lib/api.ts's interceptor, which reads storage directly to avoid importing the store)
// picks up the latest token without an extra round trip.
store.subscribe(() => {
  const { auth } = store.getState();
  try {
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  } catch {
    /* storage unavailable (private mode, quota) — session just won't survive a reload */
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
