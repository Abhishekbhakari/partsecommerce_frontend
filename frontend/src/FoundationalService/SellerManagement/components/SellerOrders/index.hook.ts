import { useEffect, useState } from "react";
import { toast } from "sonner";
import { sellerService, type SellerOrderItemRow } from "../../service/seller.service";
import { getErrorMessage } from "@/Common/types/api";
import type { FulfillmentStatus } from "@/Common/types/entities";

export const FULFILLMENT_STATUSES: FulfillmentStatus[] = [
  "pending",
  "picked_up",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "failed"
];

/** Order **items** belonging to this seller (not full orders) — a seller never sees another
 * seller's items in a shared order, per docs/PHASE3_ADDENDUM.md §4. */
export function useSellerOrders() {
  const [items, setItems] = useState<SellerOrderItemRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    sellerService
      .listOrders({ page: 1, pageSize: 50 })
      .then((res) => {
        setItems(res.data.items ?? []);
        setTotal(res.data.total ?? 0);
      })
      .catch(() => {
        setItems([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (orderItemId: number, status: FulfillmentStatus) => {
    setUpdatingId(orderItemId);
    try {
      await sellerService.updateFulfillment(orderItemId, status);
      setItems((prev) => prev.map((it) => (it.id === orderItemId ? { ...it, fulfillmentStatus: status } : it)));
      toast.success("Fulfillment status updated");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't update fulfillment status."));
    } finally {
      setUpdatingId(null);
    }
  };

  return { items, total, loading, updatingId, updateStatus };
}
