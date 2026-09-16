import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import type { Order } from "@/Common/types/entities";
import { checkoutService } from "../../service/checkout.service";
import { formatMoney } from "@/Common/lib/utils";
import { Button } from "@/Common/components/ui/button";
import { Spinner } from "@/Common/components/ui/spinner";

export default function OrderConfirmation() {
  const { orderId = "" } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkoutService
      .getOrder(orderId)
      .then((res) => setOrder(res.data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <Spinner />;

  return (
    <div className="container flex flex-col items-center py-16 text-center">
      <CheckCircle2 className="h-14 w-14 text-success" />
      <h1 className="mt-4 text-2xl font-extrabold">Order Placed!</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {order ? `Order #${order.orderNumber} · ${formatMoney(order.total)}` : `Order #${orderId}`}
      </p>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        We've sent a confirmation email with your order details. You can track its status from your account.
      </p>
      <div className="mt-6 flex gap-3">
        <Link to={`/account/orders/${orderId}`}>
          <Button>Track Order</Button>
        </Link>
        <Link to="/products">
          <Button variant="outline">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}
