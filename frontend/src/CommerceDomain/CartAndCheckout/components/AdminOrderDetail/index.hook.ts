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

  const updateStatus = async (status: OrderStatus) => {
    if (!order) return;
    setUpdating(true);
    try {
      const res = await adminOrderService.updateStatus(order.id, status);
      setOrder(res.data);
      toast.success(`Order marked as ${status}`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't update order status."));
    } finally {
      setUpdating(false);
    }
  };

  return { order, loading, updating, updateStatus, statusFlow: STATUS_FLOW };
}
