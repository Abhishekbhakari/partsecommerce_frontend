import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SellerAuthState, SellerLoginPayload } from "@/Common/types/sellerAuth";
import { SELLER_AUTH_STORAGE_KEY } from "@/Common/lib/api";
import type { Seller } from "@/Common/types/entities";

/** Seller session is a fully separate redux slice/storage key from `authSlice` (customer/admin) —
 * per docs/PHASE3_ADDENDUM.md §5, a seller login must never collide with an admin or customer
 * session already open in the same browser. */
function loadPersistedState(): SellerAuthState {
  const empty: SellerAuthState = { token: null, refreshToken: null, seller: null };
  try {
    const stored = sessionStorage.getItem(SELLER_AUTH_STORAGE_KEY);
    if (!stored) return empty;
    return { ...empty, ...JSON.parse(stored) };
  } catch {
    return empty;
  }
}

const sellerAuthSlice = createSlice({
  name: "sellerAuth",
  initialState: loadPersistedState(),
  reducers: {
    sellerLoginSucceeded(state, action: PayloadAction<SellerLoginPayload>) {
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.seller = action.payload.seller;
    },
    sellerLoggedOut(state) {
      state.token = null;
      state.refreshToken = null;
      state.seller = null;
    },
    sellerProfileUpdated(state, action: PayloadAction<Partial<Seller>>) {
      if (state.seller) state.seller = { ...state.seller, ...action.payload };
    }
  }
});

export const { sellerLoginSucceeded, sellerLoggedOut, sellerProfileUpdated } = sellerAuthSlice.actions;
export default sellerAuthSlice.reducer;
