import type { Seller } from "./entities";

export interface SellerAuthState {
  token: string | null;
  refreshToken: string | null;
  seller: Seller | null;
}

export interface SellerLoginPayload {
  accessToken: string;
  refreshToken: string;
  seller: Seller;
}
