import type { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/Common/components/Layout/RequireAuth";
import Login from "../components/Login";
import AccountLayout from "../components/AccountLayout";
import Profile from "../components/Profile";
import Addresses from "../components/Addresses";
import OrderHistory from "../components/OrderHistory";
import OrderDetail from "../components/OrderDetail";
import AdminCustomerList from "../components/AdminCustomerList";
import AdminCustomerDetail from "../components/AdminCustomerDetail";

/** Public login route, nested under StorefrontLayout alongside catalog routes. */
export const customerAccountManagementPublicRoutes: RouteObject[] = [{ path: "/login", element: <Login /> }];

/** Auth-guarded /account/* routes, nested under StorefrontLayout in App.tsx. */
export const customerAccountManagementRoutes: RouteObject[] = [
  {
    element: <RequireAuth />,
    children: [
      {
        path: "/account",
        element: <AccountLayout />,
        children: [
          { index: true, element: <Profile /> },
          { path: "profile", element: <Profile /> },
          { path: "addresses", element: <Addresses /> },
          { path: "orders", element: <OrderHistory /> },
          { path: "orders/:id", element: <OrderDetail /> }
        ]
      }
    ]
  }
];

/** Admin routes — nested under AdminLayout in App.tsx (RequireAdminAuth-guarded). */
export const customerAccountManagementAdminRoutes: RouteObject[] = [
  { path: "customers", element: <AdminCustomerList /> },
  { path: "customers/:id", element: <AdminCustomerDetail /> }
];
