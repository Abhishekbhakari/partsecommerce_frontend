import { useEffect, useState } from "react";
import type { ProductSummary } from "@/Common/types/entities";
import type { Order } from "@/Common/types/entities";
import { reportsService, type ReportPoint } from "../../service/reports.service";
import { adminOrderService } from "@/CommerceDomain/CartAndCheckout/service/adminOrder.service";

export function useAdminDashboard() {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [lowStock, setLowStock] = useState<ProductSummary[]>([]);
  const [salesSeries, setSalesSeries] = useState<ReportPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const to = new Date().toISOString().slice(0, 10);
    const from = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);

    Promise.allSettled([
      adminOrderService.list({ page: 1, pageSize: 5 }),
      reportsService.lowStock(10),
      reportsService.salesReport(from, to, "day")
    ]).then(([ordersRes, lowStockRes, salesRes]) => {
      if (ordersRes.status === "fulfilled") {
        setRecentOrders(ordersRes.value.data.items ?? []);
        setTotalOrders(ordersRes.value.data.total ?? 0);
      }
      if (lowStockRes.status === "fulfilled") setLowStock(lowStockRes.value.data ?? []);
      if (salesRes.status === "fulfilled") setSalesSeries(salesRes.value.data.series ?? []);
      setLoading(false);
    });
  }, []);

  const totalSales = salesSeries.reduce((sum, p) => sum + p.value, 0);

  return { recentOrders, totalOrders, lowStock, salesSeries, totalSales, loading };
}
