import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/Common/hooks/useAuth";
import { useSellerAuth } from "@/Common/hooks/useSellerAuth";

/** Guards customer-account routes (/account/*) — redirects to /login, preserving the intended
 * destination so login can send the user back. */
export function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

/** Guards /admin/* routes (except /admin/login) — redirects to the admin login screen. */
export function RequireAdminAuth() {
  const { isAdminAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

/** Guards /seller/* portal routes (except register/login/account-status) — redirects to the
 * seller login screen. Uses the fully separate seller session (useSellerAuth), never the
 * customer/admin one. */
export function RequireSellerAuth() {
  const { isSellerAuthenticated } = useSellerAuth();
  const location = useLocation();
  if (!isSellerAuthenticated) {
    return <Navigate to="/seller/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
