import type { RouteObject } from "react-router-dom";
import CategoryBrandMaster from "../components/CategoryBrandMaster";
import CouponManagement from "../components/CouponManagement";
import CouponForm from "../components/CouponForm";
import BannerManagement from "../components/BannerManagement";
import BannerForm from "../components/BannerForm";
import ReviewModeration from "../components/ReviewModeration";

/** Admin routes — nested under AdminLayout in App.tsx (RequireAdminAuth-guarded). */
export const masterManagementAdminRoutes: RouteObject[] = [
  { path: "masters", element: <CategoryBrandMaster /> },
  { path: "coupons", element: <CouponManagement /> },
  { path: "coupons/new", element: <CouponForm /> },
  { path: "coupons/:id/edit", element: <CouponForm /> },
  { path: "banners", element: <BannerManagement /> },
  { path: "banners/new", element: <BannerForm /> },
  { path: "banners/:id/edit", element: <BannerForm /> },
  { path: "reviews", element: <ReviewModeration /> }
];
