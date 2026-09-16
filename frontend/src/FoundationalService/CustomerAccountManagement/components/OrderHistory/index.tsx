import { Link } from "react-router-dom";
import { useOrderHistory } from "./index.hook";
import { formatMoney, formatDate } from "@/Common/lib/utils";
import { Badge } from "@/Common/components/ui/badge";
import { Button } from "@/Common/components/ui/button";
import { Card, CardContent } from "@/Common/components/ui/card";
import { Spinner } from "@/Common/components/ui/spinner";
import { Pagination } from "@/Common/components/ui/pagination";
import { EmptyState } from "@/Common/components/EmptyState";
import { NoOrdersIllustration } from "@/Common/components/EmptyState/illustrations";

const STATUS_VARIANT: Record<string, "default" | "success" | "destructive" | "secondary"> = {
  pending: "secondary",
  confirmed: "default",
  packed: "default",
  shipped: "default",
  delivered: "success",
  cancelled: "destructive",
  returned: "destructive"
};

export default function OrderHistory() {
  const { items, total, page, pageSize, setPage, loading } = useOrderHistory();

  if (loading) return <Spinner />;

  if (items.length === 0) {
    return (
      <EmptyState
        illustration={<NoOrdersIllustration />}
        title="No orders yet"
        description="Once you place an order, it'll show up here."
        action={
          <Link to="/products">
            <Button>Start Shopping</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((order) => (
        <Link key={order.id} to={`/account/orders/${order.id}`}>
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">#{order.orderNumber}</p>
                <p className="text-xs text-muted-foreground">
                  Placed {formatDate(order.placedAt)} · {order.items?.length ?? 0} item(s)
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold">{formatMoney(order.total)}</span>
                <Badge variant={STATUS_VARIANT[order.status] ?? "secondary"} className="capitalize">
                  {order.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} className="mt-4" />
    </div>
  );
}
