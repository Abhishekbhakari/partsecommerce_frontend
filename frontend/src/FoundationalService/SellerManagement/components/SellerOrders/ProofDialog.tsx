import { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { Modal } from "@/Common/components/ui/modal";
import { Button } from "@/Common/components/ui/button";
import { Textarea } from "@/Common/components/ui/textarea";
import { Label } from "@/Common/components/ui/label";
import { ImageUploader } from "@/Common/components/ImageUploader";
import type { ProofStage } from "./index.hook";

const COPY: Record<ProofStage, { title: string; hint: string; confirm: string; notePlaceholder: string }> = {
  dispatch: {
    title: "Photo of the packed item",
    hint: "Take a clear photo of the item as it is handed to the courier, with the label and packaging visible. This is your record if the buyer later disputes what was sent.",
    confirm: "Confirm dispatch",
    notePlaceholder: "e.g. Packed in original box, sealed, AWB label attached"
  },
  delivery: {
    title: "Delivery photo",
    hint: "Add a photo showing the item was delivered, e.g. the parcel at the customer's door or in their hands. This is your proof of delivery.",
    confirm: "Confirm delivery",
    notePlaceholder: "e.g. Handed to customer / left with security as instructed"
  }
};

interface Props {
  open: boolean;
  stage: ProofStage;
  itemLabel: string;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: (images: string[], note: string) => void;
}

/** Blocks the status change until at least one photo is attached. The backend enforces the same
 * rule, so this is UX (asking up front), not the security boundary. */
export function ProofDialog({ open, stage, itemLabel, submitting, onCancel, onConfirm }: Props) {
  const [images, setImages] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const copy = COPY[stage];

  // Fresh form every time the dialog opens for a new item/stage.
  useEffect(() => {
    if (open) {
      setImages([]);
      setNote("");
    }
  }, [open, stage, itemLabel]);

  return (
    <Modal open={open} onClose={submitting ? () => undefined : onCancel} title={copy.title}>
      <p className="text-sm font-semibold">{itemLabel}</p>
      <p className="mt-1 flex gap-2 text-xs text-muted-foreground">
        <Camera className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        {copy.hint}
      </p>

      <div className="mt-4">
        <ImageUploader images={images} onChange={setImages} maxImages={6} scope="seller" capture />
      </div>

      <div className="mt-4">
        <Label>Note (optional)</Label>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={500} placeholder={copy.notePlaceholder} />
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="button" disabled={images.length === 0} loading={submitting} onClick={() => onConfirm(images, note)}>
          {copy.confirm}
        </Button>
      </div>
      {images.length === 0 && <p className="mt-2 text-right text-xs text-muted-foreground">Add at least one photo to continue.</p>}
    </Modal>
  );
}
