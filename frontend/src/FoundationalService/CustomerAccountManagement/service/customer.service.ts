import api from "@/Common/lib/api";
import type { User, Address, ProductSummary } from "@/Common/types/entities";

/** Per docs/API_CONTRACT.md "Customer Account". */
export const customerService = {
  getProfile: () => api.get<User>("/me"),
  updateProfile: (data: { name?: string; email?: string; phone?: string }) => api.patch<User>("/me", data),

  listAddresses: () => api.get<Address[]>("/me/addresses"),
  addAddress: (data: Partial<Address>) => api.post<Address>("/me/addresses", data),
  updateAddress: (id: number, data: Partial<Address>) => api.patch<Address>(`/me/addresses/${id}`, data),
  deleteAddress: (id: number) => api.delete<{ success: boolean }>(`/me/addresses/${id}`),

  listWishlist: () => api.get<ProductSummary[]>("/me/wishlist"),
  addToWishlist: (productId: number) => api.post(`/me/wishlist/${productId}`),
  removeFromWishlist: (productId: number) => api.delete(`/me/wishlist/${productId}`)
};

/** Admin — Customers, per docs/API_CONTRACT.md "Admin — Orders & Customers". */
export const adminCustomerService = {
  list: (params: { q?: string; page?: number; pageSize?: number }) =>
    api.get<{ items: User[]; total: number }>("/admin/customers", { params }),
  getById: (id: number | string) => api.get<User & { orders: unknown[] }>(`/admin/customers/${id}`)
};
