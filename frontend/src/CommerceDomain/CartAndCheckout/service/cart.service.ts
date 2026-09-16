import api from "@/Common/lib/api";
import type { Cart } from "@/Common/types/entities";
import type { PincodeCheckResponse } from "../types/cart.types";

/** Per docs/API_CONTRACT.md "Cart" — works for both guest (X-Cart-Session header, attached by
 * Common/lib/api.ts's request interceptor) and logged-in (Bearer token) sessions. */
export const cartService = {
  getCart: () => api.get<Cart>("/cart"),
  addItem: (variantId: number, qty: number) => api.post<Cart>("/cart/items", { variantId, qty }),
  updateItem: (itemId: number, qty: number) => api.patch<Cart>(`/cart/items/${itemId}`, { qty }),
  removeItem: (itemId: number) => api.delete<Cart>(`/cart/items/${itemId}`),
  applyCoupon: (code: string) => api.post<Cart>("/cart/apply-coupon", { code }),
  removeCoupon: () => api.delete<Cart>("/cart/coupon"),
  checkPincode: (pincode: string) => api.get<PincodeCheckResponse>("/cart/pincode-check", { params: { pincode } })
};
