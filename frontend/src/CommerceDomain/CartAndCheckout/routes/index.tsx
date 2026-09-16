import type { RouteObject } from "react-router-dom";
import Cart from "../components/Cart";
import Checkout from "../components/Checkout";
import OrderConfirmation from "../components/OrderConfirmation";
import AdminOrderList from "../components/AdminOrderList";
import AdminOrderDetail from "../components/AdminOrderDetail";

/** Storefront routes — nested under StorefrontLayout in App.tsx. */
export const cartAndCheckoutRoutes: RouteObject[] = [
  { path: "/cart", element: <Cart /> },
  { path: "/checkout", element: <Checkout /> },
  { path: "/order-confirmation/:orderId", element: <OrderConfirmation /> }
];

/** Admin routes — nested under AdminLayout in App.tsx (RequireAdminAuth-guarded). */
export const cartAndCheckoutAdminRoutes: RouteObject[] = [
  { path: "orders", element: <AdminOrderList /> },
  { path: "orders/:id", element: <AdminOrderDetail /> }
];
