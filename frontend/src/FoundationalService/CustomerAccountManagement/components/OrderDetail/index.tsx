import { Link } from "react-router-dom";
import { Download, XCircle, Truck } from "lucide-react";
import { useOrderDetail } from "./index.hook";
import { formatMoney, formatDate } from "@/Common/lib/utils";
import { Badge } from "@/Common/components/ui/badge";
import { Card, CardContent } from "@/Common/components/ui/card";
import { Button } from "@/Common/components/ui/button";
import { Spinner } from "@/Common/components/ui/spinner";
import { Breadcrumb } from "@/Common/components/ui/breadcrumb";

const TRACKABLE_STATUSES = ["confirmed", "packed", "shipped", "delivered"];

const CANCELLABLE_STATUSES = ["pending", "confirmed"];

export default function OrderDetail() {
  const { order, loading, cancelling, handleCancel, invoiceUrl } = useOrderDetail();

  if (loading) return <Spinner />;
  if (!order) return <p className="py-16 text-center text-sm text-muted-foreground">Order not found.</p>;

  return (
    <div>
      <Breadcrumb items={[{ label: "Orders", to: "/account/orders" }, { label: `#${order.orderNumber}` }]} />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-extrabold">Order #{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">Placed {formatDate(order.placedAt)}</p>
        </div>
        <Badge className="capitalize">{order.status}</Badge>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardContent className="p-4 sm:p-5">
            <p className="mb-3 font-semibold">Items</p>
            <div className="divide-y divide-border">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-medium">{item.productTitleSnapshot}</p>
                    <p className="text-xs text-muted-foreground">Qty {item.qty}</p>
                  </div>
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
              {order.discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>-{formatMoney(order.discount)}</span>
                </div>
              )}
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

          <div className="flex flex-col gap-2">
            {TRACKABLE_STATUSES.includes(order.status) && (
              <Link to={`/account/orders/${order.id}/track`}>
                <Button variant="outline" className="w-full">
                  <Truck className="h-4 w-4" /> Track Order
                </Button>
              </Link>
            )}
            <a href={invoiceUrl} target="_blank" rel="noreferrer">
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4" /> Download Invoice
              </Button>
            </a>
            {CANCELLABLE_STATUSES.includes(order.status) && (
              <Button variant="destructive" className="w-full" loading={cancelling} onClick={handleCancel}>
                <XCircle className="h-4 w-4" /> Cancel Order
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
