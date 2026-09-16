import api from "@/Common/lib/api";
import type { AdminUser } from "@/Common/types/entities";

export interface AdminAuthTokens {
  accessToken: string;
  refreshToken: string;
  user: AdminUser;
}

/**
 * Backend implemented a dedicated admin auth route group (see backend/STATUS.md):
 * POST /admin/auth/login, /admin/auth/refresh, /admin/auth/logout, GET /admin/auth/me.
 * The refresh token is also set as an httpOnly `adminRefreshToken` cookie scoped to
 * /api/v1/admin/auth, separate from the customer `customerRefreshToken` cookie, so the two
 * token types never collide in the browser.
 */
export const adminAuthService = {
  login: (email: string, password: string) => api.post<AdminAuthTokens>("/admin/auth/login", { email, password }),
  refresh: () => api.post<{ accessToken: string }>("/admin/auth/refresh"),
  logout: () => api.post("/admin/auth/logout")
};
