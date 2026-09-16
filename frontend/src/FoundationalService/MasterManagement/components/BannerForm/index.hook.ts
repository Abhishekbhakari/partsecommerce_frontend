import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { masterService } from "../../service/master.service";
import { bannerFormSchema } from "../../validators/BannerForm";
import { getErrorMessage } from "@/Common/types/api";

const PLACEMENTS = ["home_hero", "home_secondary", "category_top", "cart_promo"];

const emptyForm = {
  title: "",
  imageUrl: "",
  link: "",
  placement: PLACEMENTS[0],
  active: true
};

/** Create/edit form for `/admin/banners` — title, image (via `ImageUploader`/upload endpoint),
 * link, placement, active toggle, per docs/PHASE2_ADDENDUM.md §5. */
export function useBannerForm() {
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
      .listBanners()
      .then((res) => {
        const b = (res.data ?? []).find((x) => x.id === Number(id));
        if (!b) throw new Error("not found");
        setForm({ title: b.title, imageUrl: b.imageUrl, link: b.link ?? "", placement: b.placement, active: b.active });
      })
      .catch(() => toast.error("Couldn't load this banner for editing."))
      .finally(() => setLoading(false));
  }, [id]);

  const setField = <K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = bannerFormSchema.safeParse(form);
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
    const payload = { ...parsed.data, link: parsed.data.link || undefined };
    try {
      if (isEdit && id) {
        await masterService.updateBanner(Number(id), payload);
        toast.success("Banner updated");
      } else {
        await masterService.createBanner(payload);
        toast.success("Banner created");
      }
      navigate("/admin/banners");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't save this banner."));
    } finally {
      setSaving(false);
    }
  };

  return { form, setField, errors, loading, saving, isEdit, handleSubmit, PLACEMENTS };
}
