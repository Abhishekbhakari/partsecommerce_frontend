import type { RouteObject } from "react-router-dom";
import CategoryBrandMaster from "../components/CategoryBrandMaster";
import CouponManagement from "../components/CouponManagement";
import BannerManagement from "../components/BannerManagement";
import ReviewModeration from "../components/ReviewModeration";

/** Admin routes — nested under AdminLayout in App.tsx (RequireAdminAuth-guarded). */
export const masterManagementAdminRoutes: RouteObject[] = [
  { path: "masters", element: <CategoryBrandMaster /> },
  { path: "coupons", element: <CouponManagement /> },
  { path: "banners", element: <BannerManagement /> },
  { path: "reviews", element: <ReviewModeration /> }
];
