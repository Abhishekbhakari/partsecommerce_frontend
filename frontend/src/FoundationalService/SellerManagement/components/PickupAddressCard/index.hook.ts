import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { sellerService } from "../../service/seller.service";
import { sellerAuthService } from "../../service/sellerAuth.service";
import { getErrorMessage } from "@/Common/types/api";

const pickupSchema = z.object({
  line1: z.string().min(3, "Enter the street address"),
  line2: z.string().optional(),
  city: z.string().min(2, "Enter the city"),
  state: z.string().min(2, "Enter the state"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  phone: z.string().min(6, "Enter a contact phone for the courier")
});

const empty = { line1: "", line2: "", city: "", state: "", pincode: "", phone: "" };

/** Where the courier collects this seller's parcels. The pincode decides every shipping quote for
 * the seller's items, so until it's set quotes assume a default origin and are less accurate. */
export function usePickupAddress() {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    sellerAuthService
      .me()
      .then((res) => {
        const a = res.data.pickupAddress;
        if (a) {
          setForm({ line1: a.line1, line2: a.line2 ?? "", city: a.city, state: a.state, pincode: a.pincode, phone: a.phone });
          setSaved(true);
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const setField = (key: keyof typeof empty, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = pickupSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => (fieldErrors[String(issue.path[0])] = issue.message));
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await sellerService.updatePickupAddress({ ...parsed.data, line2: parsed.data.line2 || undefined });
      setSaved(true);
      toast.success("Pickup address saved");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't save the pickup address."));
    } finally {
      setSaving(false);
    }
  };

  return { form, setField, errors, loading, saving, saved, handleSubmit };
}
