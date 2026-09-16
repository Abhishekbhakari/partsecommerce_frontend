import api from "@/Common/lib/api";
import type { Order, OrderStatus } from "@/Common/types/entities";

/** Admin — Orders & Customers calls per docs/API_CONTRACT.md. */
export const adminOrderService = {
  list: (params: { status?: string; page?: number; pageSize?: number; q?: string }) =>
    api.get<{ items: Order[]; total: number }>("/admin/orders", { params }),

  getById: (id: number | string) => api.get<Order>(`/orders/${id}`),

  updateStatus: (id: number, status: OrderStatus) => api.patch<Order>(`/admin/orders/${id}/status`, { status })
};
