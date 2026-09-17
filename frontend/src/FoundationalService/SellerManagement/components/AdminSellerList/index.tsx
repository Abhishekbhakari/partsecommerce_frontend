import { Check, X, Ban, Percent, Wallet } from "lucide-react";
import { useAdminSellerList } from "./index.hook";
import { formatMoney, formatDate } from "@/Common/lib/utils";
import type { Seller } from "@/Common/types/entities";
import { Button } from "@/Common/components/ui/button";
import { Badge } from "@/Common/components/ui/badge";
import { Select } from "@/Common/components/ui/select";
import { Input } from "@/Common/components/ui/input";
import { Label } from "@/Common/components/ui/label";
import { Modal } from "@/Common/components/ui/modal";
import { DataTable, type DataTableColumn } from "@/Common/components/ui/data-table";

const STATUS_BADGE = { pending: "secondary", approved: "success", rejected: "destructive", suspended: "outline" } as const;

/** Admin "Sellers" section — list with status filter, approve/reject/suspend actions, commission
 * override field, payout generation + mark-paid, per docs/PHASE3_ADDENDUM.md §5. Reuses DataTable
 * + Modal patterns from the existing admin screens. */
export default function AdminSellerList() {
  const {
    items,
    total,
    status,
    setStatus,
    loading,
    busy,
    approve,
    suspend,
    rejectOpen,
    setRejectOpen,
    rejectReason,
    setRejectReason,
    openReject,
    submitReject,
    commissionOpen,
    setCommissionOpen,
    commissionValue,
    setCommissionValue,
    openCommission,
    submitCommission,
    payoutOpen,
    setPayoutOpen,
    payoutStart,
    setPayoutStart,
    payoutEnd,
    setPayoutEnd,
    lastPayout,
    selected,
    openPayout,
    submitPayout,
    markPaid
  } = useAdminSellerList();

  const columns: DataTableColumn<Seller>[] = [
    {
      key: "business",
      header: "Seller",
      render: (s) => (
        <div>
          <p className="font-semibold">{s.businessName}</p>
          <p className="text-xs text-muted-foreground">{s.email}</p>
        </div>
      )
    },
    { key: "phone", header: "Phone", render: (s) => s.phone || "—" },
    {
      key: "commission",
      header: "Commission",
      render: (s) => (s.commissionRateOverride != null ? `${s.commissionRateOverride}%` : "Default")
    },
    { key: "status", header: "Status", render: (s) => <Badge variant={STATUS_BADGE[s.status]} className="capitalize">{s.status}</Badge> },
    {
      key: "actions",
      header: "",
      render: (s) => (
        <div className="flex flex-wrap items-center gap-2">
          {s.status === "pending" && (
            <>
              <Button variant="success" size="sm" disabled={busy} onClick={() => approve(s)}>
                <Check className="h-3.5 w-3.5" /> Approve
              </Button>
              <Button variant="destructive" size="sm" disabled={busy} onClick={() => openReject(s)}>
                <X className="h-3.5 w-3.5" /> Reject
              </Button>
            </>
          )}
          {s.status === "approved" && (
            <Button variant="outline" size="sm" disabled={busy} onClick={() => suspend(s)}>
              <Ban className="h-3.5 w-3.5" /> Suspend
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => openCommission(s)}>
            <Percent className="h-3.5 w-3.5" /> Commission
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openPayout(s)}>
            <Wallet className="h-3.5 w-3.5" /> Payout
          </Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold">Sellers</h1>
          <p className="text-sm text-muted-foreground">{total} registered sellers</p>
        </div>
        <Select
          className="max-w-[200px]"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { label: "All Statuses", value: "" },
            { label: "Pending", value: "pending" },
            { label: "Approved", value: "approved" },
            { label: "Rejected", value: "rejected" },
            { label: "Suspended", value: "suspended" }
          ]}
        />
      </div>

      <div className="mt-4">
        <DataTable columns={columns} rows={items} rowKey={(s) => s.id} loading={loading} emptyMessage="No sellers found." />
      </div>

      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title={`Reject ${selected?.businessName ?? ""}`}>
        <Label>Reason</Label>
        <Input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Why is this application being rejected?" />
        <Button className="mt-4 w-full" variant="destructive" disabled={busy || !rejectReason.trim()} onClick={submitReject}>
          Confirm Rejection
        </Button>
      </Modal>

      <Modal open={commissionOpen} onClose={() => setCommissionOpen(false)} title={`Commission Override — ${selected?.businessName ?? ""}`}>
        <Label>Commission Rate Override (%)</Label>
        <Input
          type="number"
          value={commissionValue}
          onChange={(e) => setCommissionValue(e.target.value)}
          placeholder="Leave blank to use platform default"
        />
        <Button className="mt-4 w-full" disabled={busy} onClick={submitCommission}>
          Save
        </Button>
      </Modal>

      <Modal open={payoutOpen} onClose={() => setPayoutOpen(false)} title={`Generate Payout — ${selected?.businessName ?? ""}`}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Period Start</Label>
            <Input type="date" value={payoutStart} onChange={(e) => setPayoutStart(e.target.value)} />
          </div>
          <div>
            <Label>Period End</Label>
            <Input type="date" value={payoutEnd} onChange={(e) => setPayoutEnd(e.target.value)} />
          </div>
        </div>
        <Button className="mt-4 w-full" disabled={busy || !payoutStart || !payoutEnd} onClick={submitPayout}>
          Generate Payout
        </Button>

        {lastPayout && (
          <div className="mt-4 rounded-md border border-border p-3 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Gross Sales</span>
              <span>{formatMoney(lastPayout.grossSales)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Commission Deducted</span>
              <span>{formatMoney(lastPayout.commissionDeducted)}</span>
            </div>
            <div className="flex justify-between py-1 font-semibold">
              <span>Net Payable</span>
              <span>{formatMoney(lastPayout.netPayable)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <Badge variant={lastPayout.status === "paid" ? "success" : "secondary"}>
                {lastPayout.status === "paid" ? `Paid ${lastPayout.paidAt ? formatDate(lastPayout.paidAt) : ""}` : "Pending"}
              </Badge>
              {lastPayout.status === "pending" && (
                <Button size="sm" disabled={busy} onClick={markPaid}>
                  Mark as Paid
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
