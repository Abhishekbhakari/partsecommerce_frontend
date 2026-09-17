import { Wallet } from "lucide-react";
import { useSellerPayouts } from "./index.hook";
import { formatMoney, formatDate } from "@/Common/lib/utils";
import { StatCard } from "@/Common/components/ui/stat-card";
import { Badge } from "@/Common/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/Common/components/ui/data-table";
import type { SellerPayout } from "@/Common/types/entities";

export default function SellerPayouts() {
  const { items, pendingBalance, loading } = useSellerPayouts();

  const columns: DataTableColumn<SellerPayout>[] = [
    { key: "period", header: "Period", render: (p) => `${formatDate(p.periodStart)} – ${formatDate(p.periodEnd)}` },
    { key: "grossSales", header: "Gross Sales", render: (p) => formatMoney(p.grossSales) },
    { key: "commissionDeducted", header: "Commission", render: (p) => formatMoney(p.commissionDeducted) },
    { key: "netPayable", header: "Net Payable", render: (p) => formatMoney(p.netPayable) },
    {
      key: "status",
      header: "Status",
      render: (p) => <Badge variant={p.status === "paid" ? "success" : "secondary"}>{p.status}</Badge>
    },
    { key: "paidAt", header: "Paid On", render: (p) => (p.paidAt ? formatDate(p.paidAt) : "—") }
  ];

  return (
    <div>
      <h1 className="text-xl font-extrabold">Payouts</h1>
      <p className="text-sm text-muted-foreground">Your payout history and current pending balance.</p>

      <div className="mt-4 max-w-xs">
        <StatCard label="Pending Balance" value={formatMoney(pendingBalance)} icon={Wallet} />
      </div>

      <div className="mt-6">
        <DataTable columns={columns} rows={items} rowKey={(p) => p.id} loading={loading} emptyMessage="No payouts generated yet." />
      </div>
    </div>
  );
}
