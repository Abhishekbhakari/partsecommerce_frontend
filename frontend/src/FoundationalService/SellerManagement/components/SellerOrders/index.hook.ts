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

const SHIPPED: FulfillmentStatus[] = ["picked_up", "in_transit", "out_for_delivery"];

export type ProofStage = "dispatch" | "delivery";

/** Mirrors the backend rule in seller-portal.service.ts (which is the real enforcement — this
 * only decides whether to ask for photos up front instead of letting the API 400):
 *  - first time an item leaves the seller (pending → any shipped state) needs a dispatch photo
 *  - marking it delivered needs a delivery photo */
export function proofStageFor(current: FulfillmentStatus | undefined, next: FulfillmentStatus): ProofStage | null {
  const from = current ?? "pending";
  if (next === "delivered" && from !== "delivered") return "delivery";
  if (from === "pending" && SHIPPED.includes(next)) return "dispatch";
  return null;
}

interface PendingChange {
  item: SellerOrderItemRow;
  status: FulfillmentStatus;
  stage: ProofStage;
}

/** Order **items** belonging to this seller (not full orders) — a seller never sees another
 * seller's items in a shared order, per docs/PHASE3_ADDENDUM.md §4. */
export function useSellerOrders() {
  const [items, setItems] = useState<SellerOrderItemRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [pending, setPending] = useState<PendingChange | null>(null);

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

  const apply = async (
    item: SellerOrderItemRow,
    status: FulfillmentStatus,
    proof?: { proofImages: string[]; note?: string }
  ) => {
    setUpdatingId(item.id);
    try {
      const res = await sellerService.updateFulfillment(item.id, status, proof);
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, fulfillmentStatus: status, proofs: res.data?.proofs ?? it.proofs } : it))
      );
      toast.success(proof ? "Status updated and photos saved" : "Fulfillment status updated");
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't update fulfillment status."));
      return false;
    } finally {
      setUpdatingId(null);
    }
  };

  /** Called by the status dropdown: transitions that need proof open the dialog instead. */
  const requestStatusChange = (item: SellerOrderItemRow, status: FulfillmentStatus) => {
    const stage = proofStageFor(item.fulfillmentStatus, status);
    if (stage) setPending({ item, status, stage });
    else void apply(item, status);
  };

  const confirmWithProof = async (proofImages: string[], note: string) => {
    if (!pending) return;
    const ok = await apply(pending.item, pending.status, { proofImages, note: note.trim() || undefined });
    if (ok) setPending(null);
  };

  return {
    items,
    total,
    loading,
    updatingId,
    pending,
    cancelPending: () => setPending(null),
    requestStatusChange,
    confirmWithProof
  };
}
