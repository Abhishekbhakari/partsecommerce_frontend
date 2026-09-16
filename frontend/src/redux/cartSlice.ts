import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Cart } from "@/Common/types/entities";

interface CartState {
  itemCount: number;
  total: number;
}

const initialState: CartState = { itemCount: 0, total: 0 };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /** Cross-cutting summary (badge count in header) synced whenever CartAndCheckout fetches/
     * mutates the cart — the full Cart object itself stays local to that feature's index.hook.ts. */
    cartSynced(state, action: PayloadAction<Cart>) {
      state.itemCount = action.payload.items.reduce((sum, item) => sum + item.qty, 0);
      state.total = action.payload.total;
    },
    cartCleared(state) {
      state.itemCount = 0;
      state.total = 0;
    }
  }
});

export const { cartSynced, cartCleared } = cartSlice.actions;
export default cartSlice.reducer;
