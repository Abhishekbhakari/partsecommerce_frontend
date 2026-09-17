import api from "@/Common/lib/api";
import type { Order, OrderItem, Product, SellerDashboardStats, SellerPayout } from "@/Common/types/entities";
import type { ProductListResponse } from "@/CommerceDomain/CatalogManagement/types/catalog.types";

export interface SellerOrderItemRow extends OrderItem {
  order?: Pick<Order, "id" | "orderNumber" | "status" | "shippingAddress" | "placedAt">;
}

/** Seller self-service portal calls — every query is implicitly scoped server-side to the
 * authenticated seller (see backend/STATUS.md Phase 3 §3), never trusted from the client. */
export const sellerService = {
  dashboard: () => api.get<SellerDashboardStats>("/seller/dashboard"),

  listProducts: (params: { q?: string; page?: number; pageSize?: number }) =>
    api.get<ProductListResponse>("/seller/products", { params }),

  getProductBySlug: (slug: string) => api.get<Product>(`/products/${slug}`),

  createProduct: (data: Partial<Product>) => api.post<Product>("/seller/products", data),

  updateProduct: (id: number, data: Partial<Product>) => api.patch<Product>(`/seller/products/${id}`, data),

  removeProduct: (id: number) => api.delete(`/seller/products/${id}`),

  updateInventory: (id: number, variantId: number, stock: number) =>
    api.patch(`/seller/products/${id}/inventory`, { variantId, stock }),

  importCsv: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/seller/products/import", form, { headers: { "Content-Type": "multipart/form-data" } });
  },

  listOrders: (params: { page?: number; pageSize?: number; status?: string }) =>
    api.get<{ items: SellerOrderItemRow[]; total: number }>("/seller/orders", { params }),

  updateFulfillment: (orderItemId: number, status: string) =>
    api.patch(`/seller/orders/items/${orderItemId}/fulfillment`, { status }),

  // Contract deviation found live: backend returns `{ payouts: [...], pendingBalance }`, not
  // `{ items: [...] }` like every other list endpoint in this app — verified via
  // `GET /seller/payouts` on the running backend. Kept as `payouts` here to match; flagged in
  // frontend/STATUS.md for backend follow-up/contract-doc sync rather than silently renamed.
  listPayouts: () => api.get<{ payouts: SellerPayout[]; pendingBalance: number }>("/seller/payouts")
};
