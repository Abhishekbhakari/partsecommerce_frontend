import api from "@/Common/lib/api";
import type { AdminUser } from "@/Common/types/entities";

export interface AdminAuthTokens {
  accessToken: string;
  refreshToken: string;
  admin: AdminUser;
}

/**
 * ASSUMPTION (see frontend/STATUS.md): docs/API_CONTRACT.md doesn't define a distinct admin
 * login endpoint, only `/auth/email/login` for customers. We reuse that path for staff login —
 * backend should either branch on account type there or Backend should add a dedicated
 * `/admin/auth/login`; flag this in a PR note so both agents can align.
 */
export const adminAuthService = {
  login: (email: string, password: string) => api.post<AdminAuthTokens>("/auth/email/login", { email, password }),
  logout: () => api.post("/auth/logout")
};
