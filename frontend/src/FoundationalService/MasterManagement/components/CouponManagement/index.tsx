import { useEffect, useState } from "react";
import { Tag } from "lucide-react";
import type { Coupon } from "@/Common/types/entities";
import { masterService } from "../../service/master.service";
import { formatMoney, formatDate } from "@/Common/lib/utils";
import { Badge } from "@/Common/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/Common/components/ui/data-table";

/** List-only for now (P1 in docs/BACKLOG.md) — create/edit form to follow once prioritized. */
export default function CouponManagement() {
  const [items, setItems] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    masterService
      .listCoupons()
      .then((res) => setItems(res.data ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const columns: DataTableColumn<Coupon>[] = [
    { key: "code", header: "Code", render: (c) => <span className="font-mono font-semibold">{c.code}</span> },
    { key: "value", header: "Value", render: (c) => (c.type === "percentage" ? `${c.value}%` : formatMoney(c.value)) },
    { key: "validTo", header: "Valid Until", render: (c) => formatDate(c.validTo) },
    { key: "active", header: "Status", render: (c) => <Badge variant={c.active ? "success" : "secondary"}>{c.active ? "Active" : "Inactive"}</Badge> }
  ];

  return (
    <div>
      <h1 className="flex items-center gap-2 text-xl font-extrabold">
        <Tag className="h-5 w-5" /> Coupons
      </h1>
      <div className="mt-4">
        <DataTable columns={columns} rows={items} rowKey={(c) => c.id} loading={loading} emptyMessage="No coupons yet." />
      </div>
    </div>
  );
}
