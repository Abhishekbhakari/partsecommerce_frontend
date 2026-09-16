import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminOrderList } from "./index.hook";
import type { Order } from "@/Common/types/entities";
import { formatMoney, formatDate } from "@/Common/lib/utils";
import { Input } from "@/Common/components/ui/input";
import { Select } from "@/Common/components/ui/select";
import { Badge } from "@/Common/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/Common/components/ui/data-table";
import { Pagination } from "@/Common/components/ui/pagination";

const STATUS_OPTIONS = [
  { label: "All statuses", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Packed", value: "packed" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Returned", value: "returned" }
];

const STATUS_VARIANT: Record<string, "default" | "success" | "destructive" | "secondary"> = {
  pending: "secondary",
  delivered: "success",
  cancelled: "destructive",
  returned: "destructive"
};

export default function AdminOrderList() {
  const { items, total, page, pageSize, setPage, status, setStatus, search, setSearch, loading } = useAdminOrderList();
  const navigate = useNavigate();

  const columns: DataTableColumn<Order>[] = [
    { key: "orderNumber", header: "Order #", render: (o) => <span className="font-semibold">#{o.orderNumber}</span> },
    { key: "placedAt", header: "Date", render: (o) => formatDate(o.placedAt) },
    { key: "total", header: "Total", render: (o) => formatMoney(o.total) },
    {
      key: "status",
      header: "Status",
      render: (o) => (
        <Badge variant={STATUS_VARIANT[o.status] ?? "default"} className="capitalize">
          {o.status}
        </Badge>
      )
    }
  ];

  return (
    <div>
      <h1 className="text-xl font-extrabold">Orders</h1>
      <p className="text-sm text-muted-foreground">{total} total orders</p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search order # or customer…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="sm:w-56">
          <Select value={status} onChange={(e) => setStatus(e.target.value)} options={STATUS_OPTIONS} />
        </div>
      </div>

      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={items}
          rowKey={(o) => o.id}
          loading={loading}
          emptyMessage="No orders found."
          onRowClick={(o) => navigate(`/admin/orders/${o.id}`)}
        />
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} className="mt-4" />
      </div>
    </div>
  );
}
