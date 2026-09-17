import { IndianRupee, Wallet, ListOrdered, AlertTriangle } from "lucide-react";
import { useSellerDashboard } from "./index.hook";
import { formatMoney, formatDate } from "@/Common/lib/utils";
import { StatCard } from "@/Common/components/ui/stat-card";
import { Card, CardContent } from "@/Common/components/ui/card";
import { Spinner } from "@/Common/components/ui/spinner";
import { Badge } from "@/Common/components/ui/badge";

export default function SellerDashboard() {
  const { stats, loading } = useSellerDashboard();

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-xl font-extrabold">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Your sales, orders and payouts at a glance.</p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Sales This Month" value={formatMoney(stats?.salesThisMonth ?? 0)} icon={IndianRupee} />
        <StatCard label="Pending Payout" value={formatMoney(stats?.pendingPayoutAmount ?? 0)} icon={Wallet} />
        <StatCard label="Orders" value={String(stats?.orderCount ?? 0)} icon={ListOrdered} />
        <StatCard label="Low Stock" value={String(stats?.lowStockCount ?? 0)} icon={AlertTriangle} />
      </div>

      <Card className="mt-6">
        <CardContent className="p-4 sm:p-5">
          <p className="mb-3 font-semibold">Recent Orders</p>
          {stats?.recentOrders?.length ? (
            <div className="divide-y divide-border">
              {stats.recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-semibold">#{o.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(o.placedAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{formatMoney(o.total)}</span>
                    <Badge className="capitalize">{o.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
