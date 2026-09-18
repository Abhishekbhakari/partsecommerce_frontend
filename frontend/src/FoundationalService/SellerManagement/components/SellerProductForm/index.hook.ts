import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import type { Category, Brand, ProductStatus } from "@/Common/types/entities";
import { catalogService } from "@/CommerceDomain/CatalogManagement/service/catalog.service";
import { sellerService } from "../../service/seller.service";
import { sellerProductFormSchema } from "@/CommerceDomain/CatalogManagement/validators/SellerProductForm";
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
  stock: "0",
  status: "draft" as ProductStatus,
  description: "",
  images: [] as string[]
};

/** Mirrors AdminProductForm's hook exactly, minus the sellerId field — a seller's own products
 * are always scoped to their own account server-side, never accepted from the request body
 * (backend/STATUS.md Phase 3 §3: SellerProductSchema omits sellerId at the Zod layer). Points at
 * `/seller/products/*` via sellerService instead of adminProductService. */
export function useSellerProductForm() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const isEdit = Boolean(slug);

  const [form, setForm] = useState(emptyForm);
  const [productId, setProductId] = useState<number | null>(null);
  // See AdminProductForm's hook for why this is tracked separately from productId.
  const [defaultVariant, setDefaultVariant] = useState<{ id: number; name: string } | null>(null);
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
    sellerService
      .getProductBySlug(slug)
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
    const parsed = sellerProductFormSchema.safeParse(form);
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
        variants: [
          defaultVariant
            ? { id: defaultVariant.id, name: defaultVariant.name, stock }
            : { name: "Standard", priceDelta: 0, stock }
        ]
      };
      if (isEdit && productId != null) {
        await sellerService.updateProduct(productId, payload as any);
        toast.success("Product updated");
      } else {
        await sellerService.createProduct(payload as any);
        toast.success("Product created");
      }
      navigate("/seller/products");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't save this product."));
    } finally {
      setSaving(false);
    }
  };

  return { form, setField, errors, categories, brands, loading, saving, isEdit, handleSubmit };
}
