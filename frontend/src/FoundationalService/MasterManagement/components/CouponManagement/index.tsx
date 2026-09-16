import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Tag, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Coupon } from "@/Common/types/entities";
import { masterService } from "../../service/master.service";
import { formatMoney, formatDate } from "@/Common/lib/utils";
import { Badge } from "@/Common/components/ui/badge";
import { Button } from "@/Common/components/ui/button";
import { DataTable, type DataTableColumn } from "@/Common/components/ui/data-table";

export default function CouponManagement() {
  const [items, setItems] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    masterService
      .listCoupons()
      .then((res) => setItems(res.data ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this coupon? This can't be undone.")) return;
    try {
      await masterService.deleteCoupon(id);
      toast.success("Coupon deleted");
      load();
    } catch {
      toast.error("Couldn't delete this coupon.");
    }
  };

  const columns: DataTableColumn<Coupon>[] = [
    { key: "code", header: "Code", render: (c) => <span className="font-mono font-semibold">{c.code}</span> },
    { key: "value", header: "Value", render: (c) => (c.type === "percentage" ? `${c.value}%` : formatMoney(c.value)) },
    { key: "validTo", header: "Valid Until", render: (c) => formatDate(c.validTo) },
    { key: "active", header: "Status", render: (c) => <Badge variant={c.active ? "success" : "secondary"}>{c.active ? "Active" : "Inactive"}</Badge> },
    {
      key: "actions",
      header: "",
      render: (c) => (
        <div className="flex items-center gap-2">
          <Link to={`/admin/coupons/${c.id}/edit`}>
            <Button variant="ghost" size="icon" aria-label="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => handleDelete(c.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-xl font-extrabold">
          <Tag className="h-5 w-5" /> Coupons
        </h1>
        <Link to="/admin/coupons/new">
          <Button>
            <Plus className="h-4 w-4" /> New Coupon
          </Button>
        </Link>
      </div>
      <div className="mt-4">
        <DataTable columns={columns} rows={items} rowKey={(c) => c.id} loading={loading} emptyMessage="No coupons yet." />
      </div>
    </div>
  );
}
