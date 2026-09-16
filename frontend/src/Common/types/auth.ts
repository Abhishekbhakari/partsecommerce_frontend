import type { User, AdminUser } from "./entities";

export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  admin: AdminUser | null;
}

export interface LoginPayload {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface AdminLoginPayload {
  accessToken: string;
  refreshToken: string;
  admin: AdminUser;
}
