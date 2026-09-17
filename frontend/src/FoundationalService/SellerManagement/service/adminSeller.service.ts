import api from "@/Common/lib/api";
import type { Seller, SellerPayout } from "@/Common/types/entities";

/** Admin seller-management calls per backend/STATUS.md Phase 3 §5 —
 * `FoundationalService/SellerManagement/api/admin`. Approve/reject/suspend/commission/payout
 * generation are `requireOwner`-gated server-side (business-sensitive). */
export const adminSellerService = {
  list: (params: { status?: string; page?: number; pageSize?: number; q?: string }) =>
    api.get<{ items: Seller[]; total: number }>("/admin/sellers", { params }),

  getById: (id: number) => api.get<Seller>(`/admin/sellers/${id}`),

  approve: (id: number) => api.patch<Seller>(`/admin/sellers/${id}/approve`),

  reject: (id: number, reason: string) => api.patch<Seller>(`/admin/sellers/${id}/reject`, { reason }),

  suspend: (id: number) => api.patch<Seller>(`/admin/sellers/${id}/suspend`),

  setCommission: (id: number, commissionRateOverride: number | null) =>
    api.patch<Seller>(`/admin/sellers/${id}/commission`, { commissionRateOverride }),

  generatePayout: (id: number, periodStart: string, periodEnd: string) =>
    api.post<SellerPayout>(`/admin/sellers/${id}/payouts`, { periodStart, periodEnd }),

  markPayoutPaid: (payoutId: number) => api.patch<SellerPayout>(`/admin/payouts/${payoutId}/mark-paid`)
};
