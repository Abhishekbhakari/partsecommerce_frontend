import type { RouteObject } from "react-router-dom";
import AdminDashboard from "../components/AdminDashboard";

/** Admin routes — nested under AdminLayout in App.tsx (RequireAdminAuth-guarded). */
export const reportingAndAnalyticsAdminRoutes: RouteObject[] = [{ index: true, element: <AdminDashboard /> }];
