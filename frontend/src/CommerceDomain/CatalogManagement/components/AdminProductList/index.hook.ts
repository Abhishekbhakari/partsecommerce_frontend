import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import type { ProductSummary } from "@/Common/types/entities";
import { adminProductService } from "../../service/adminProduct.service";
import { useDebouncedValue } from "@/Common/hooks/useDebouncedValue";
import { getErrorMessage } from "@/Common/types/api";

const PAGE_SIZE = 20;

export function useAdminProductList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1");
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const debouncedSearch = useDebouncedValue(search, 400);

  const [items, setItems] = useState<ProductSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminProductService
      .list({ q: debouncedSearch || undefined, page, pageSize: PAGE_SIZE })
      .then((res) => {
        setItems(res.data.items ?? []);
        setTotal(res.data.total ?? 0);
      })
      .catch(() => {
        setItems([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [debouncedSearch, page]);

  const setPage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(nextPage));
    setSearchParams(next);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Archive this product? It will no longer be visible in the storefront.")) return;
    try {
      await adminProductService.remove(id);
      toast.success("Product archived");
      setItems((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't archive this product."));
    }
  };

  return {
    items,
    total,
    page,
    pageSize: PAGE_SIZE,
    setPage,
    search,
    setSearch,
    loading,
    handleDelete,
    goToCreate: () => navigate("/admin/products/new"),
    goToEdit: (slug: string) => navigate(`/admin/products/${slug}/edit`)
  };
}
