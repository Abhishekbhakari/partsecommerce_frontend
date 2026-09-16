import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import type { Order } from "@/Common/types/entities";
import { checkoutService } from "@/CommerceDomain/CartAndCheckout/service/checkout.service";
import { getErrorMessage } from "@/Common/types/api";

export function useOrderDetail() {
  const { id = "" } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const load = () => {
    setLoading(true);
    checkoutService
      .getOrder(id)
      .then((res) => setOrder(res.data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleCancel = async () => {
    if (!order) return;
    const reason = prompt("Reason for cancellation:");
    if (!reason) return;
    setCancelling(true);
    try {
      const res = await checkoutService.cancelOrder(order.id, reason);
      setOrder(res.data);
      toast.success("Order cancelled");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't cancel this order."));
    } finally {
      setCancelling(false);
    }
  };

  return { order, loading, cancelling, handleCancel, invoiceUrl: order ? checkoutService.getInvoiceUrl(order.id) : "" };
}
