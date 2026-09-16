import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Category, Brand, ProductSummary } from "@/Common/types/entities";
import { catalogService } from "../../service/catalog.service";

const PAGE_SIZE = 12;

export function useProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get("category") ?? "";
  const brand = searchParams.get("brand") ?? "";
  const priceMin = searchParams.get("priceMin") ?? "";
  const priceMax = searchParams.get("priceMax") ?? "";
  const sort = searchParams.get("sort") ?? "popular";
  const page = Number(searchParams.get("page") ?? "1");

  const [items, setItems] = useState<ProductSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    catalogService
      .getCategories()
      .then((res) => setCategories(res.data ?? []))
      .catch(() => setCategories([]));
    catalogService
      .getBrands()
      .then((res) => setBrands(res.data ?? []))
      .catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    catalogService
      .getProducts({
        category: category || undefined,
        brand: brand || undefined,
        priceMin: priceMin ? Number(priceMin) : undefined,
        priceMax: priceMax ? Number(priceMax) : undefined,
        sort,
        page,
        pageSize: PAGE_SIZE
      })
      .then((res) => {
        if (cancelled) return;
        setItems(res.data.items ?? []);
        setTotal(res.data.total ?? 0);
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setItems([]);
        setTotal(0);
        setError("Couldn't load products right now — the catalog API may not be running yet.");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [category, brand, priceMin, priceMax, sort, page]);

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setSearchParams(next);
  };

  const setPage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(nextPage));
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams({});

  return {
    items,
    total,
    pageSize: PAGE_SIZE,
    page,
    categories,
    brands,
    filters: { category, brand, priceMin, priceMax, sort },
    updateFilter,
    setPage,
    clearFilters,
    loading,
    error
  };
}
