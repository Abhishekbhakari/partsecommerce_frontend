import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import type { Category, Brand, ProductStatus } from "@/Common/types/entities";
import { catalogService } from "../../service/catalog.service";
import { adminProductService } from "../../service/adminProduct.service";
import { adminProductFormSchema } from "../../validators/AdminProductForm";
import { getErrorMessage } from "@/Common/types/api";

const emptyForm = {
  title: "",
  sku: "",
  categoryId: "",
  brandId: "",
  partNumber: "",
  oemNumber: "",
  basePrice: "",
  gstRate: "18",
  status: "draft" as ProductStatus,
  description: "",
  images: [] as string[]
};

export function useAdminProductForm() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const isEdit = Boolean(slug);

  const [form, setForm] = useState(emptyForm);
  // The route param is the product's slug (needed for the public GET /products/:slug lookup),
  // but PATCH /admin/products/:id takes the numeric id — captured here once the product loads.
  const [productId, setProductId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    catalogService.getCategories().then((res) => setCategories(res.data ?? [])).catch(() => setCategories([]));
    catalogService.getBrands().then((res) => setBrands(res.data ?? [])).catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    if (!slug) return;
    adminProductService
      .getById(slug)
      .then((res) => {
        const p = res.data;
        setProductId(p.id);
        setForm({
          title: p.title,
          sku: p.sku,
          categoryId: String(p.categoryId),
          brandId: String(p.brandId),
          partNumber: p.partNumber ?? "",
          oemNumber: p.oemNumber ?? "",
          basePrice: String(p.basePrice),
          gstRate: String(p.gstRate),
          status: p.status,
          description: p.description ?? "",
          images: p.images ?? []
        });
      })
      .catch(() => toast.error("Couldn't load this product for editing."))
      .finally(() => setLoading(false));
  }, [slug]);

  const setField = <K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = adminProductFormSchema.safeParse(form);
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
    try {
      const payload = {
        ...parsed.data,
        categoryId: Number(parsed.data.categoryId),
        brandId: Number(parsed.data.brandId)
      };
      if (isEdit && productId != null) {
        await adminProductService.update(productId, payload as any);
        toast.success("Product updated");
      } else {
        await adminProductService.create(payload as any);
        toast.success("Product created");
      }
      navigate("/admin/products");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't save this product."));
    } finally {
      setSaving(false);
    }
  };

  return { form, setField, errors, categories, brands, loading, saving, isEdit, handleSubmit };
}
