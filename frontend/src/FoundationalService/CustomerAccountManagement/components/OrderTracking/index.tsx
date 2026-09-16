import { Check, PackageCheck, Truck, Home, ClipboardList, XCircle } from "lucide-react";
import { useOrderTracking, TIMELINE_STEPS } from "./index.hook";
import { formatDate } from "@/Common/lib/utils";
import { Breadcrumb } from "@/Common/components/ui/breadcrumb";
import { Card, CardContent } from "@/Common/components/ui/card";
import { Spinner } from "@/Common/components/ui/spinner";
import { cn } from "@/Common/lib/utils";

const STEP_META: Record<(typeof TIMELINE_STEPS)[number], { label: string; icon: typeof Check }> = {
  pending: { label: "Order Placed", icon: ClipboardList },
  confirmed: { label: "Confirmed", icon: Check },
  packed: { label: "Packed", icon: PackageCheck },
  shipped: { label: "Shipped", icon: Truck },
  delivered: { label: "Delivered", icon: Home }
};

/** Visual status timeline (placed → confirmed → packed → shipped → delivered), linked from Order
 * Detail, per docs/PHASE2_ADDENDUM.md §5. */
export default function OrderTracking() {
  const { order, history, currentStatus, currentStepIndex, loading } = useOrderTracking();

  if (loading) return <Spinner />;
  if (!order) return <p className="py-16 text-center text-sm text-muted-foreground">Order not found.</p>;

  const isTerminalIssue = currentStatus === "cancelled" || currentStatus === "returned";

  return (
    <div>
      <Breadcrumb
        items={[{ label: "Orders", to: "/account/orders" }, { label: `#${order.orderNumber}`, to: `/account/orders/${order.id}` }, { label: "Track" }]}
      />
      <h1 className="mt-3 text-xl font-extrabold">Track Order #{order.orderNumber}</h1>

      {isTerminalIssue ? (
        <Card className="mt-5">
          <CardContent className="flex items-center gap-3 p-5">
            <XCircle className="h-8 w-8 text-destructive" />
            <div>
              <p className="font-bold capitalize">{currentStatus}</p>
              <p className="text-sm text-muted-foreground">This order was {currentStatus}.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-5">
          <CardContent className="p-5 sm:p-6">
            <ol className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-0">
              {TIMELINE_STEPS.map((step, i) => {
                const meta = STEP_META[step];
                const Icon = meta.icon;
                const done = i <= currentStepIndex;
                const isLast = i === TIMELINE_STEPS.length - 1;
                return (
                  <li key={step} className="relative flex flex-1 items-start gap-3 sm:flex-col sm:items-center sm:text-center">
                    {!isLast && (
                      <span
                        className={cn(
                          "absolute left-4 top-8 h-[calc(100%-2rem)] w-0.5 sm:left-1/2 sm:top-4 sm:h-0.5 sm:w-full",
                          done && i < currentStepIndex ? "bg-primary-700" : "bg-border"
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
                        done ? "border-primary-700 bg-primary-700 text-white" : "border-border bg-background text-muted-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="sm:mt-2">
                      <p className={cn("text-sm font-semibold", done ? "text-foreground" : "text-muted-foreground")}>{meta.label}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      )}

      {history.length > 0 && (
        <Card className="mt-5">
          <CardContent className="p-5">
            <p className="mb-3 font-semibold">Tracking History</p>
            <ul className="flex flex-col gap-3">
              {history
                .slice()
                .reverse()
                .map((ev, i) => (
                  <li key={i} className="flex items-center justify-between border-b border-border pb-2 text-sm last:border-0 last:pb-0">
                    <span className="capitalize font-medium">{ev.status}</span>
                    <span className="text-muted-foreground">{ev.timestamp ? formatDate(ev.timestamp) : "—"}</span>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {history.length === 0 && !isTerminalIssue && (
        <p className="mt-4 text-sm text-muted-foreground">Detailed carrier tracking will appear here once your order ships.</p>
      )}
    </div>
  );
}
