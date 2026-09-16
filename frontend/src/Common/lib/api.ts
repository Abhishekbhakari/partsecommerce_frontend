import axios from "axios";

/** sessionStorage key for the persisted auth session (token + user); mirrored by redux/authSlice. */
export const AUTH_STORAGE_KEY = "spareparts_auth";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true
});

function readToken(): string | null {
  try {
    const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored)?.token ?? null;
  } catch {
    return null;
  }
}

function writeToken(token: string): void {
  try {
    const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    parsed.token = token;
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    /* best-effort — a failed persist just means the next reload re-prompts login */
  }
}

/** Guest cart session id, sent as `X-Cart-Session` per API_CONTRACT.md so an anonymous cart
 * survives across requests until the visitor logs in. */
const CART_SESSION_KEY = "spareparts_cart_session";
export function getCartSessionId(): string {
  let id = localStorage.getItem(CART_SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(CART_SESSION_KEY, id);
  }
  return id;
}

api.interceptors.request.use((config) => {
  const token = readToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (!token) config.headers["X-Cart-Session"] = getCartSessionId();
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token as string)));
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config ?? {};
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const isAuthRoute =
      originalRequest.url?.includes("/auth/") && !originalRequest.url?.includes("/auth/logout");
    if (isAuthRoute) return Promise.reject(error);

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
      const refreshToken = stored ? JSON.parse(stored)?.refreshToken : null;
      const { data } = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken },
        { withCredentials: true }
      );
      const newToken = data?.data?.accessToken as string;
      writeToken(newToken);
      api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      processQueue(null, newToken);
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      if (window.location.pathname.startsWith("/admin")) {
        window.location.href = "/admin/login";
      } else {
        window.location.href = "/login";
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
