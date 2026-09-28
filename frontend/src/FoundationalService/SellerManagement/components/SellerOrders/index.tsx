import { useSellerOrders, FULFILLMENT_STATUSES } from "./index.hook";
import { ProofDialog } from "./ProofDialog";
import { ProofGallery } from "@/Common/components/ProofGallery";
import { formatMoney } from "@/Common/lib/utils";
import { Badge } from "@/Common/components/ui/badge";
import { Select } from "@/Common/components/ui/select";
import { DataTable, type DataTableColumn } from "@/Common/components/ui/data-table";
import type { SellerOrderItemRow } from "../../service/seller.service";

const STATUS_BADGE: Record<string, "secondary" | "accent" | "success" | "destructive"> = {
  pending: "secondary",
  picked_up: "accent",
  in_transit: "accent",
  out_for_delivery: "accent",
  delivered: "success",
  failed: "destructive"
};

export default function SellerOrders() {
  const { items, total, loading, updatingId, pending, cancelPending, requestStatusChange, confirmWithProof } = useSellerOrders();

  const columns: DataTableColumn<SellerOrderItemRow>[] = [
    {
      key: "order",
      header: "Order",
      render: (it) => <span className="font-semibold">#{it.order?.orderNumber ?? it.orderId}</span>
    },
    { key: "product", header: "Item", render: (it) => `${it.productTitleSnapshot} × ${it.qty}` },
    { key: "total", header: "Line Total", render: (it) => formatMoney(it.unitPrice * it.qty) },
    { key: "earning", header: "Your Earning", render: (it) => (it.sellerEarning != null ? formatMoney(it.sellerEarning) : "—") },
    {
      key: "status",
      header: "Fulfillment Status",
      render: (it) => (
        <Badge variant={STATUS_BADGE[it.fulfillmentStatus ?? "pending"] ?? "secondary"} className="capitalize">
          {(it.fulfillmentStatus ?? "pending").replace(/_/g, " ")}
        </Badge>
      )
    },
    {
      key: "proof",
      header: "Photo proof",
      render: (it) => (it.proofs?.length ? <ProofGallery proofs={it.proofs} compact /> : <span className="text-xs text-muted-foreground">None yet</span>)
    },
    {
      key: "actions",
      header: "Update",
      render: (it) => (
        <Select
          value={it.fulfillmentStatus ?? "pending"}
          disabled={updatingId === it.id}
          onChange={(e) => requestStatusChange(it, e.target.value as any)}
          options={FULFILLMENT_STATUSES.map((s) => ({ label: s.replace(/_/g, " "), value: s }))}
        />
      )
    }
  ];

  return (
    <div>
      <h1 className="text-xl font-extrabold">Orders</h1>
      <p className="text-sm text-muted-foreground">{total} of your order items across all customer orders</p>

      <div className="mt-4">
        <DataTable columns={columns} rows={items} rowKey={(it) => it.id} loading={loading} emptyMessage="No order items yet." />
      </div>

      <ProofDialog
        open={pending != null}
        stage={pending?.stage ?? "dispatch"}
        itemLabel={pending ? `${pending.item.productTitleSnapshot} x ${pending.item.qty} - #${pending.item.order?.orderNumber ?? pending.item.orderId}` : ""}
        submitting={pending != null && updatingId === pending.item.id}
        onCancel={cancelPending}
        onConfirm={confirmWithProof}
      />
    </div>
  );
}
