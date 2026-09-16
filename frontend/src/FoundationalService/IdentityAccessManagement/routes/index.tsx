import type { RouteObject } from "react-router-dom";
import AdminLogin from "../components/AdminLogin";
import StaffManagement from "../components/StaffManagement";

/** Public — rendered outside AdminLayout in App.tsx. */
export const identityAccessManagementPublicRoutes: RouteObject[] = [{ path: "/admin/login", element: <AdminLogin /> }];

/** Admin routes — nested under AdminLayout in App.tsx (RequireAdminAuth-guarded). */
export const identityAccessManagementAdminRoutes: RouteObject[] = [{ path: "staff", element: <StaffManagement /> }];
