import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import type { Category, Brand, ProductStatus, Seller } from "@/Common/types/entities";
import { catalogService } from "../../service/catalog.service";
import { adminProductService } from "../../service/adminProduct.service";
import { adminSellerService } from "@/FoundationalService/SellerManagement/service/adminSeller.service";
import { adminProductFormSchema } from "../../validators/AdminProductForm";
import { getErrorMessage } from "@/Common/types/api";

const emptyForm = {
  title: "",
  sku: "",
  categoryId: "",
  brandId: "",
  sellerId: "",
  partNumber: "",
  oemNumber: "",
  basePrice: "",
  gstRate: "18",
  stock: "0",
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
  // The product's first variant, if one already exists (edit mode) — stock lives on the variant,
  // not the product itself, so updating it means updating this variant by id (keeping its real
  // name, e.g. from a bulk CSV import) rather than creating a second one. Null on create, where
  // the backend makes a "Standard" variant for us.
  const [defaultVariant, setDefaultVariant] = useState<{ id: number; name: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    catalogService.getCategories().then((res) => setCategories(res.data ?? [])).catch(() => setCategories([]));
    catalogService.getBrands().then((res) => setBrands(res.data ?? [])).catch(() => setBrands([]));
    adminSellerService
      .list({ status: "approved", pageSize: 200 })
      .then((res) => setSellers(res.data.items ?? []))
      .catch(() => setSellers([]));
  }, []);

  useEffect(() => {
    if (!slug) return;
    adminProductService
      .getById(slug)
      .then((res) => {
        const p = res.data;
        setProductId(p.id);
        const variant = p.variants?.[0];
        setDefaultVariant(variant ? { id: variant.id, name: variant.name } : null);
        setForm({
          title: p.title,
          sku: p.sku,
          categoryId: String(p.categoryId),
          brandId: String(p.brandId),
          sellerId: p.sellerId != null ? String(p.sellerId) : "",
          partNumber: p.partNumber ?? "",
          oemNumber: p.oemNumber ?? "",
          basePrice: String(p.basePrice),
          gstRate: String(p.gstRate),
          stock: String(variant?.stock ?? 0),
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
      const { stock, ...rest } = parsed.data;
      const payload = {
        ...rest,
        categoryId: Number(parsed.data.categoryId),
        brandId: Number(parsed.data.brandId),
        sellerId: Number(parsed.data.sellerId),
        // Stock lives on the product's variant, not the product row itself (see
        // docs/DATA_MODEL.md) — this form only manages a single variant. On edit, update the
        // existing one by id (preserving its real name); on create, the backend makes one.
        variants: [
          defaultVariant
            ? { id: defaultVariant.id, name: defaultVariant.name, stock }
            : { name: "Standard", priceDelta: 0, stock }
        ]
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

  return { form, setField, errors, categories, brands, sellers, loading, saving, isEdit, handleSubmit };
}
