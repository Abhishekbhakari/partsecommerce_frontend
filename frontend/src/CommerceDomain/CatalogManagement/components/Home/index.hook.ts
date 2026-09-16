import { useEffect, useState } from "react";
import type { Category, ProductSummary } from "@/Common/types/entities";
import { catalogService } from "../../service/catalog.service";

export function useHome() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([catalogService.getCategories(), catalogService.getProducts({ page: 1, pageSize: 8, sort: "popular" })])
      .then(([catRes, prodRes]) => {
        if (cancelled) return;
        setCategories(catRes.data ?? []);
        setFeatured(prodRes.data.items ?? []);
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;
        // Backend may not be running yet during early frontend dev — fail gracefully.
        setError("Couldn't load live data right now — showing an empty state until the API is reachable.");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, featured, loading, error };
}
