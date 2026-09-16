import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, LoginPayload, AdminLoginPayload } from "@/Common/types/auth";
import { AUTH_STORAGE_KEY } from "@/Common/lib/api";

function loadPersistedState(): AuthState {
  const empty: AuthState = { token: null, refreshToken: null, user: null, admin: null };
  try {
    const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return empty;
    return { ...empty, ...JSON.parse(stored) };
  } catch {
    return empty;
  }
}

const authSlice = createSlice({
  name: "auth",
  initialState: loadPersistedState(),
  reducers: {
    customerLoginSucceeded(state, action: PayloadAction<LoginPayload>) {
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.admin = null;
    },
    adminLoginSucceeded(state, action: PayloadAction<AdminLoginPayload>) {
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.admin = action.payload.user;
      state.user = null;
    },
    loggedOut(state) {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.admin = null;
    },
    profileUpdated(state, action: PayloadAction<Partial<NonNullable<AuthState["user"]>>>) {
      if (state.user) state.user = { ...state.user, ...action.payload };
    }
  }
});

export const { customerLoginSucceeded, adminLoginSucceeded, loggedOut, profileUpdated } = authSlice.actions;
export default authSlice.reducer;
