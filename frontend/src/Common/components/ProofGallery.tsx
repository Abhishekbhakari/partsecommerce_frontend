import { PackageCheck, Truck } from "lucide-react";
import type { FulfillmentProof } from "@/Common/types/entities";

const STAGE_META = {
  dispatch: { label: "Dispatched", icon: Truck },
  delivery: { label: "Delivered", icon: PackageCheck }
} as const;

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

/** Read-only view of a seller's dispatch/delivery photos for one order item — shared by the
 * customer's order page, the seller's own order list and the admin order detail, so all three
 * see the same evidence with the same server-recorded timestamps. Renders nothing when the item
 * has no proof yet. Photos open full-size in a new tab. */
export function ProofGallery({ proofs, compact = false }: { proofs?: FulfillmentProof[]; compact?: boolean }) {
  if (!proofs?.length) return null;
  const ordered = [...proofs].sort((a, b) => (a.stage === b.stage ? 0 : a.stage === "dispatch" ? -1 : 1));

  return (
    <div className={compact ? "space-y-2" : "mt-3 space-y-3 rounded-lg border border-border bg-secondary/40 p-3"}>
      {ordered.map((proof) => {
        const { label, icon: Icon } = STAGE_META[proof.stage];
        return (
          <div key={proof.id}>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Icon className="h-3.5 w-3.5 text-primary" />
              {label} <span className="font-normal text-muted-foreground">· {formatWhen(proof.createdAt)}</span>
            </p>
            {proof.note && <p className="mt-0.5 text-xs text-muted-foreground">“{proof.note}”</p>}
            <div className="mt-1.5 flex flex-wrap gap-2">
              {proof.imageUrls.map((src, i) => (
                <a key={src + i} href={src} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-md border border-border">
                  <img src={src} alt={`${label} photo ${i + 1}`} className={compact ? "h-12 w-12 object-cover" : "h-20 w-20 object-cover"} />
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
