import type { RouteObject } from "react-router-dom";
import Home from "../components/Home";
import ProductListing from "../components/ProductListing";
import ProductDetail from "../components/ProductDetail";
import SearchResults from "../components/SearchResults";
import FitmentFinderPage from "../pages/FitmentFinderPage";
import AdminProductList from "../components/AdminProductList";
import AdminProductForm from "../components/AdminProductForm";

/** Storefront routes — nested under StorefrontLayout in App.tsx. */
export const catalogManagementRoutes: RouteObject[] = [
  { path: "/", element: <Home /> },
  { path: "/products", element: <ProductListing /> },
  { path: "/products/:slug", element: <ProductDetail /> },
  { path: "/fitment-finder", element: <FitmentFinderPage /> },
  { path: "/search", element: <SearchResults /> }
];

/** Admin routes — nested under AdminLayout in App.tsx (RequireAdminAuth-guarded). */
export const catalogManagementAdminRoutes: RouteObject[] = [
  { path: "products", element: <AdminProductList /> },
  { path: "products/new", element: <AdminProductForm /> },
  { path: "products/:slug/edit", element: <AdminProductForm /> }
];
