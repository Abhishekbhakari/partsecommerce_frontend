import api from "@/Common/lib/api";
import type { ProductSummary } from "@/Common/types/entities";

export interface ReportPoint {
  label: string;
  value: number;
}

/** Per docs/API_CONTRACT.md "Admin — Coupons, Banners/CMS, Reports, Staff" + inventory low-stock. */
export const reportsService = {
  salesReport: (from: string, to: string, groupBy: string) =>
    api.get<{ series: ReportPoint[] }>("/admin/reports/sales", { params: { from, to, groupBy } }),

  inventoryReport: () => api.get<{ series: ReportPoint[] }>("/admin/reports/inventory"),

  lowStock: (threshold = 10) => api.get<ProductSummary[]>("/admin/inventory/low-stock", { params: { threshold } })
};
