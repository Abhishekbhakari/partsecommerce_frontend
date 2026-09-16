import { useAdminOrderDetail } from "./index.hook";
import { formatMoney, formatDate } from "@/Common/lib/utils";
import { Badge } from "@/Common/components/ui/badge";
import { Card, CardContent } from "@/Common/components/ui/card";
import { Button } from "@/Common/components/ui/button";
import { Spinner } from "@/Common/components/ui/spinner";

export default function AdminOrderDetail() {
  const { order, loading, updating, updateStatus, statusFlow } = useAdminOrderDetail();

  if (loading) return <Spinner />;
  if (!order) return <p className="py-16 text-center text-sm text-muted-foreground">Order not found.</p>;

  const currentIndex = statusFlow.indexOf(order.status);
  const isTerminal = !statusFlow.includes(order.status);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-extrabold">Order #{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">Placed {formatDate(order.placedAt)}</p>
        </div>
        <Badge className="capitalize">{order.status}</Badge>
      </div>

      {!isTerminal && (
        <Card className="mt-4">
          <CardContent className="p-4 sm:p-5">
            <p className="mb-3 text-sm font-semibold">Update Status</p>
            <div className="flex flex-wrap gap-2">
              {statusFlow.map((s, i) => (
                <Button
                  key={s}
                  size="sm"
                  variant={i === currentIndex ? "default" : "outline"}
                  disabled={updating || i <= currentIndex}
                  onClick={() => updateStatus(s)}
                  className="capitalize"
                >
                  {s}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardContent className="p-4 sm:p-5">
            <p className="mb-3 font-semibold">Items</p>
            <div className="divide-y divide-border">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between py-2 text-sm">
                  <span>
                    {item.productTitleSnapshot} × {item.qty}
                  </span>
                  <span className="font-semibold">{formatMoney(item.unitPrice * item.qty)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="space-y-2 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatMoney(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatMoney(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GST</span>
                <span>{formatMoney(order.gstAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-extrabold">
                <span>Total</span>
                <span>{formatMoney(order.total)}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-sm">
              <p className="mb-1 font-semibold">Shipping Address</p>
              <p className="text-muted-foreground">
                {order.shippingAddress?.line1}, {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
                {order.shippingAddress?.pincode}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
