import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { masterService } from "../../service/master.service";
import { couponFormSchema } from "../../validators/CouponForm";
import { getErrorMessage } from "@/Common/types/api";

const emptyForm = {
  code: "",
  type: "percentage" as "percentage" | "flat",
  value: "",
  minOrderValue: "",
  maxDiscount: "",
  validFrom: "",
  validTo: "",
  usageLimit: "",
  perUserLimit: "",
  active: true
};

function toDateInput(iso?: string | null) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

/** Create/edit form for `/admin/coupons` — code/type/value/min-order/max-discount/validity/active,
 * per docs/PHASE2_ADDENDUM.md §5. Wired to `masterService.{create,update}Coupon`. */
export function useCouponForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    masterService
      .listCoupons()
      .then((res) => {
        const c = (res.data ?? []).find((x) => x.id === Number(id));
        if (!c) throw new Error("not found");
        setForm({
          code: c.code,
          type: c.type,
          value: String(c.value),
          minOrderValue: c.minOrderValue != null ? String(c.minOrderValue) : "",
          maxDiscount: c.maxDiscount != null ? String(c.maxDiscount) : "",
          validFrom: toDateInput(c.validFrom),
          validTo: toDateInput(c.validTo),
          usageLimit: c.usageLimit != null ? String(c.usageLimit) : "",
          perUserLimit: c.perUserLimit != null ? String(c.perUserLimit) : "",
          active: c.active
        });
      })
      .catch(() => toast.error("Couldn't load this coupon for editing."))
      .finally(() => setLoading(false));
  }, [id]);

  const setField = <K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = couponFormSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        fieldErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSaving(true);
    const d = parsed.data;
    const payload = {
      code: d.code,
      type: d.type,
      value: d.value,
      minOrderValue: d.minOrderValue === "" || d.minOrderValue == null ? null : d.minOrderValue,
      maxDiscount: d.maxDiscount === "" || d.maxDiscount == null ? null : d.maxDiscount,
      validFrom: d.validFrom,
      validTo: d.validTo,
      usageLimit: d.usageLimit === "" || d.usageLimit == null ? null : d.usageLimit,
      perUserLimit: d.perUserLimit === "" || d.perUserLimit == null ? null : d.perUserLimit,
      active: d.active
    };
    try {
      if (isEdit && id) {
        await masterService.updateCoupon(Number(id), payload);
        toast.success("Coupon updated");
      } else {
        await masterService.createCoupon(payload);
        toast.success("Coupon created");
      }
      navigate("/admin/coupons");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't save this coupon."));
    } finally {
      setSaving(false);
    }
  };

  return { form, setField, errors, loading, saving, isEdit, handleSubmit };
}
