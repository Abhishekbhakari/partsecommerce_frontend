import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import type { Order, OrderStatus } from "@/Common/types/entities";
import { adminOrderService } from "../../service/adminOrder.service";
import { getErrorMessage } from "@/Common/types/api";

const STATUS_FLOW: OrderStatus[] = ["pending", "confirmed", "packed", "shipped", "delivered"];

export function useAdminOrderDetail() {
  const { id = "" } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    adminOrderService
      .getById(id)
      .then((res) => setOrder(res.data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  /** Set when the server refused Shipped/Delivered because the seller hasn't submitted photo proof —
   * the admin can then choose to override with a written reason (owner-only, logged server-side). */
  const [overrideFor, setOverrideFor] = useState<OrderStatus | null>(null);

  const updateStatus = async (status: OrderStatus, overrideReason?: string) => {
    if (!order) return false;
    setUpdating(true);
    try {
      const res = await adminOrderService.updateStatus(order.id, status, overrideReason);
      // The response has the order but the proof-bearing items come from the same detail include;
      // keep whatever we already loaded if the update response omits them.
      setOrder((prev) => ({ ...(prev as Order), ...res.data, items: res.data.items ?? prev?.items }));
      toast.success(`Order marked as ${status}`);
      setOverrideFor(null);
      return true;
    } catch (err) {
      const gated =
        (status === "shipped" || status === "delivered") &&
        !overrideReason &&
        (err as { response?: { status?: number } })?.response?.status === 422;
      if (gated) setOverrideFor(status);
      else toast.error(getErrorMessage(err, "Couldn't update order status."));
      return false;
    } finally {
      setUpdating(false);
    }
  };

  return {
    order,
    loading,
    updating,
    updateStatus,
    statusFlow: STATUS_FLOW,
    overrideFor,
    cancelOverride: () => setOverrideFor(null)
  };
}
