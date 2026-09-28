import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Modal } from "@/Common/components/ui/modal";
import { Button } from "@/Common/components/ui/button";
import { Textarea } from "@/Common/components/ui/textarea";
import { Label } from "@/Common/components/ui/label";
import type { OrderStatus } from "@/Common/types/entities";

interface Props {
  open: boolean;
  status: OrderStatus;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}

/** Shown when the server refuses to set Shipped/Delivered because the seller hasn't submitted the
 * required photos. The normal path is to ask the seller to do it; this is the owner-only escape
 * hatch (e.g. platform-owned stock nobody can log in to fulfil), and the reason is logged. */
export function OverrideDialog({ open, status, submitting, onCancel, onConfirm }: Props) {
  const [reason, setReason] = useState("");
  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  const proof = status === "delivered" ? "delivery photo from every seller" : "packed-item photo from at least one seller";

  return (
    <Modal open={open} onClose={submitting ? () => undefined : onCancel} title={`Can't mark as ${status} yet`}>
      <p className="flex gap-2 text-sm text-muted-foreground">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <span>
          This order has no {proof} on record. The seller should mark their items as {status === "delivered" ? "delivered" : "shipped"} with
          a photo — that is what proves it to the buyer.
        </span>
      </p>
      <p className="mt-3 text-sm text-muted-foreground">
        If you have to set it manually anyway (owners only), explain why. This is logged with your account.
      </p>

      <div className="mt-3">
        <Label>Reason (min. 10 characters)</Label>
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={300} placeholder="e.g. Platform-owned stock, hand-delivered by our own staff" />
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="button" disabled={reason.trim().length < 10} loading={submitting} onClick={() => onConfirm(reason.trim())}>
          Override and mark {status}
        </Button>
      </div>
    </Modal>
  );
}
