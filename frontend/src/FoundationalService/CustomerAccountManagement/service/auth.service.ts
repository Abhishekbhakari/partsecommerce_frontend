import api from "@/Common/lib/api";
import type { User } from "@/Common/types/entities";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/** Customer auth per docs/API_CONTRACT.md "Auth" — OTP, email/password, and Google are all
 * public routes returning the same token/user shape. */
export const customerAuthService = {
  requestOtp: (identifier: string) => api.post<{ requestId: string }>("/auth/otp/request", { identifier }),
  verifyOtp: (requestId: string, otp: string) => api.post<AuthTokens>("/auth/otp/verify", { requestId, otp }),
  emailLogin: (email: string, password: string) => api.post<AuthTokens>("/auth/email/login", { email, password }),
  emailRegister: (name: string, email: string, password: string) =>
    api.post<AuthTokens>("/auth/email/register", { name, email, password }),
  googleLogin: (idToken: string) => api.post<AuthTokens>("/auth/google", { idToken }),
  logout: () => api.post("/auth/logout")
};
