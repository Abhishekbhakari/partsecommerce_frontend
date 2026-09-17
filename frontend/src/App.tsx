import { BrowserRouter, useRoutes, type RouteObject } from "react-router-dom";
import StorefrontLayout from "@/Common/components/Layout/StorefrontLayout";
import AdminLayout from "@/Common/components/Layout/AdminLayout";
import { RequireAdminAuth } from "@/Common/components/Layout/RequireAuth";
import StaticPage from "@/pages/StaticPage";
import NotFound from "@/pages/NotFound";

import { catalogManagementRoutes, catalogManagementAdminRoutes } from "@/CommerceDomain/CatalogManagement/routes";
import { cartAndCheckoutRoutes, cartAndCheckoutAdminRoutes } from "@/CommerceDomain/CartAndCheckout/routes";
import { reportingAndAnalyticsAdminRoutes } from "@/CommerceDomain/ReportingAndAnalytics/routes";
import {
  customerAccountManagementPublicRoutes,
  customerAccountManagementRoutes,
  customerAccountManagementAdminRoutes
} from "@/FoundationalService/CustomerAccountManagement/routes";
import {
  identityAccessManagementPublicRoutes,
  identityAccessManagementAdminRoutes
} from "@/FoundationalService/IdentityAccessManagement/routes";
import { masterManagementAdminRoutes } from "@/FoundationalService/MasterManagement/routes";
import {
  sellerManagementPublicRoutes,
  sellerManagementRoutes,
  sellerManagementAdminRoutes
} from "@/FoundationalService/SellerManagement/routes";

/**
 * Each module owns its own routes/index.tsx and exports the URL surface it needs — App.tsx only
 * composes those under the right shell (StorefrontLayout for customer-facing, AdminLayout for
 * /admin/*), the same convention used by the reference backend/frontend in _ref/.
 */
const routeConfig: RouteObject[] = [
  {
    element: <StorefrontLayout />,
    children: [
      ...catalogManagementRoutes,
      ...cartAndCheckoutRoutes,
      ...customerAccountManagementPublicRoutes,
      ...customerAccountManagementRoutes,
      { path: "/pages/:slug", element: <StaticPage /> }
    ]
  },

  ...identityAccessManagementPublicRoutes, // /admin/login — public, outside AdminLayout
  ...sellerManagementPublicRoutes, // /seller/register, /seller/login, /seller/account-status
  ...sellerManagementRoutes, // /seller/* — its own top-level route tree/layout (RequireSellerAuth)

  {
    path: "/admin",
    element: <RequireAdminAuth />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          ...reportingAndAnalyticsAdminRoutes,
          ...catalogManagementAdminRoutes,
          ...cartAndCheckoutAdminRoutes,
          ...customerAccountManagementAdminRoutes,
          ...masterManagementAdminRoutes,
          ...identityAccessManagementAdminRoutes,
          ...sellerManagementAdminRoutes
        ]
      }
    ]
  },

  { path: "*", element: <NotFound /> }
];

function AppRoutes() {
  return useRoutes(routeConfig);
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
