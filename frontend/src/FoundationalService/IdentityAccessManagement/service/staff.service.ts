import api from "@/Common/lib/api";
import type { AdminUser, AdminRole } from "@/Common/types/entities";

/** `/admin/staff` — owner-only per backend RBAC (`requireOwner`), per docs/API_CONTRACT.md. */
export const staffService = {
  list: () => api.get<AdminUser[]>("/admin/staff"),

  invite: (data: { name: string; email: string; role: AdminRole }) => api.post<AdminUser>("/admin/staff", data),

  changeRole: (id: number, role: AdminRole) => api.patch<AdminUser>(`/admin/staff/${id}/role`, { role }),

  remove: (id: number) => api.delete<{ success: boolean }>(`/admin/staff/${id}`)
};
