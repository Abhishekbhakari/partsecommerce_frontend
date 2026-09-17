import type { RouteObject } from "react-router-dom";
import { RequireSellerAuth } from "@/Common/components/Layout/RequireAuth";
import SellerLayout from "../components/SellerLayout";
import SellerRegister from "../components/SellerRegister";
import SellerLogin from "../components/SellerLogin";
import SellerStatusScreen from "../components/SellerStatusScreen";
import SellerDashboard from "../components/SellerDashboard";
import SellerProductList from "../components/SellerProductList";
import SellerProductForm from "../components/SellerProductForm";
import SellerOrders from "../components/SellerOrders";
import SellerPayouts from "../components/SellerPayouts";
import SellerProfile from "../components/SellerProfile";
import AdminSellerList from "../components/AdminSellerList";

/** Public — register/login/account-status, rendered outside both StorefrontLayout and
 * AdminLayout in App.tsx, its own top-level route tree per docs/PHASE3_ADDENDUM.md §5. */
export const sellerManagementPublicRoutes: RouteObject[] = [
  { path: "/seller/register", element: <SellerRegister /> },
  { path: "/seller/login", element: <SellerLogin /> },
  { path: "/seller/account-status", element: <SellerStatusScreen /> }
];

/** Guarded seller-portal routes — wrapped by RequireSellerAuth + SellerLayout in App.tsx. */
export const sellerManagementRoutes: RouteObject[] = [
  {
    path: "/seller",
    element: <RequireSellerAuth />,
    children: [
      {
        element: <SellerLayout />,
        children: [
          { index: true, element: <SellerDashboard /> },
          { path: "dashboard", element: <SellerDashboard /> },
          { path: "products", element: <SellerProductList /> },
          { path: "products/new", element: <SellerProductForm /> },
          { path: "products/:slug/edit", element: <SellerProductForm /> },
          { path: "orders", element: <SellerOrders /> },
          { path: "payouts", element: <SellerPayouts /> },
          { path: "profile", element: <SellerProfile /> }
        ]
      }
    ]
  }
];

/** Admin "Sellers" section — nested under AdminLayout in App.tsx (RequireAdminAuth-guarded). */
export const sellerManagementAdminRoutes: RouteObject[] = [{ path: "sellers", element: <AdminSellerList /> }];
