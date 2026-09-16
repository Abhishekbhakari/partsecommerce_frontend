import api from "@/Common/lib/api";
import type { Product, ProductSummary } from "@/Common/types/entities";
import type { ProductListResponse } from "../types/catalog.types";

/** Admin — Products & Inventory calls per docs/API_CONTRACT.md. */
export const adminProductService = {
  list: (params: { q?: string; page?: number; pageSize?: number; category?: string }) =>
    api.get<ProductListResponse>("/products", { params }),

  getById: (slug: string) => api.get<Product>(`/products/${slug}`),

  create: (data: Partial<Product>) => api.post<Product>("/admin/products", data),

  update: (id: number, data: Partial<Product>) => api.patch<Product>(`/admin/products/${id}`, data),

  remove: (id: number) => api.delete<{ success: boolean }>(`/admin/products/${id}`),

  updateInventory: (id: number, variantId: number, stock: number) =>
    api.patch(`/admin/products/${id}/inventory`, { variantId, stock }),

  lowStock: (threshold?: number) => api.get<ProductSummary[]>("/admin/inventory/low-stock", { params: { threshold } }),

  importCsv: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/admin/products/import", form, { headers: { "Content-Type": "multipart/form-data" } });
  },

  exportCsvUrl: (category?: string) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    return `${api.defaults.baseURL}/admin/products/export?${params.toString()}`;
  }
};
