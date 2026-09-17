import { useEffect, useState } from "react";
import { sellerService } from "../../service/seller.service";
import type { SellerDashboardStats } from "@/Common/types/entities";

export function useSellerDashboard() {
  const [stats, setStats] = useState<SellerDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sellerService
      .dashboard()
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}
