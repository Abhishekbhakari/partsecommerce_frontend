import { Link } from "react-router-dom";
import { IndianRupee, ShoppingCart, AlertTriangle, Package } from "lucide-react";
import { useAdminDashboard } from "./index.hook";
import { formatMoney, formatDate } from "@/Common/lib/utils";
import { StatCard } from "@/Common/components/ui/stat-card";
import { Card, CardContent } from "@/Common/components/ui/card";
import { Badge } from "@/Common/components/ui/badge";
import { Spinner } from "@/Common/components/ui/spinner";

export default function AdminDashboard() {
  const { recentOrders, totalOrders, lowStock, totalSales, loading } = useAdminDashboard();

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-xl font-extrabold">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Last 30 days overview</p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Sales (30d)" value={formatMoney(totalSales)} icon={IndianRupee} />
        <StatCard label="Total Orders" value={String(totalOrders)} icon={ShoppingCart} />
        <StatCard label="Low Stock Items" value={String(lowStock.length)} icon={AlertTriangle} />
        <StatCard label="Active Products" value="—" icon={Package} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-bold">Recent Orders</p>
              <Link to="/admin/orders" className="text-sm font-semibold text-primary hover:underline">
                View all
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {recentOrders.map((o) => (
                  <Link key={o.id} to={`/admin/orders/${o.id}`} className="flex items-center justify-between py-2.5 text-sm hover:text-primary">
                    <div>
                      <p className="font-semibold">#{o.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(o.placedAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{formatMoney(o.total)}</span>
                      <Badge className="capitalize">{o.status}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-bold">Low Stock Alerts</p>
              <Link to="/admin/products" className="text-sm font-semibold text-primary hover:underline">
                Manage products
              </Link>
            </div>
            {lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing running low.</p>
            ) : (
              <div className="divide-y divide-border">
                {lowStock.slice(0, 6).map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                    <p className="font-medium">{p.title}</p>
                    <Badge variant="destructive">Low stock</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
