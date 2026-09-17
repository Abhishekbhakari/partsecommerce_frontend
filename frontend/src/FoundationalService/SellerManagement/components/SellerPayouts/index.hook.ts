import { useEffect, useState } from "react";
import { sellerService } from "../../service/seller.service";
import type { SellerPayout } from "@/Common/types/entities";

export function useSellerPayouts() {
  const [items, setItems] = useState<SellerPayout[]>([]);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sellerService
      .listPayouts()
      .then((res) => {
        setItems(res.data.payouts ?? []);
        setPendingBalance(res.data.pendingBalance ?? 0);
      })
      .catch(() => {
        setItems([]);
        setPendingBalance(0);
      })
      .finally(() => setLoading(false));
  }, []);

  return { items, pendingBalance, loading };
}
