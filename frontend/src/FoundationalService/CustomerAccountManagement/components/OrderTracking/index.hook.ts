import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Order } from "@/Common/types/entities";
import { checkoutService } from "@/CommerceDomain/CartAndCheckout/service/checkout.service";

export interface TrackingEvent {
  status: string;
  timestamp?: string;
  location?: string;
}

export const TIMELINE_STEPS = ["pending", "confirmed", "packed", "shipped", "delivered"] as const;

/** Order tracking timeline page — `GET /shipments/:orderId/track` (`checkoutService.trackShipment`)
 * returns `{ status, history }`, but 404s until an admin creates a shipment for the order (no
 * shipment row exists at checkout time). Fall back to the order's own status so the timeline still
 * renders a sensible "placed → confirmed → …" progress bar even pre-shipment. */
export function useOrderTracking() {
  const { id = "" } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [history, setHistory] = useState<TrackingEvent[]>([]);
  const [shipmentStatus, setShipmentStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([checkoutService.getOrder(id), checkoutService.trackShipment(id)]).then(([orderRes, trackRes]) => {
      if (orderRes.status === "fulfilled") setOrder(orderRes.value.data as Order);
      if (trackRes.status === "fulfilled") {
        const data = trackRes.value.data as { status: string; history: TrackingEvent[] };
        setShipmentStatus(data.status);
        setHistory(data.history ?? []);
      }
      setLoading(false);
    });
  }, [id]);

  const currentStatus = order?.status === "cancelled" || order?.status === "returned" ? order.status : shipmentStatus ?? order?.status ?? "pending";
  const currentStepIndex = TIMELINE_STEPS.indexOf(currentStatus as (typeof TIMELINE_STEPS)[number]);

  return { order, history, currentStatus, currentStepIndex, loading };
}
