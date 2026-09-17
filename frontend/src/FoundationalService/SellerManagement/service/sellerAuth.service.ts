import api from "@/Common/lib/api";
import type { Seller } from "@/Common/types/entities";

export interface SellerAuthTokens {
  accessToken: string;
  refreshToken: string;
  seller: Seller;
}

export interface SellerRegisterPayload {
  businessName: string;
  email: string;
  password: string;
  phone?: string;
  gstNumber?: string;
}

/**
 * Mirrors admin auth per backend/STATUS.md Phase 3 §2: separate JWT `type: 'seller'`, separate
 * refresh cookie `sellerRefreshToken` scoped to `/api/v1/seller/auth`. `login` rejects with a
 * status-specific message when the seller isn't `approved` yet — surfaced verbatim to the UI
 * (see SellerStatusScreen).
 */
export const sellerAuthService = {
  register: (data: SellerRegisterPayload) =>
    api.post<{ id: number; status: string; message: string }>("/seller/auth/register", data),
  login: (email: string, password: string) => api.post<SellerAuthTokens>("/seller/auth/login", { email, password }),
  refresh: () => api.post<{ accessToken: string }>("/seller/auth/refresh"),
  logout: () => api.post("/seller/auth/logout"),
  me: () => api.get<Seller>("/seller/auth/me")
};
