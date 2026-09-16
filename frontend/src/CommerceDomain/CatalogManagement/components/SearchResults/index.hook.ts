import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Product } from "@/Common/types/entities";
import { catalogService } from "../../service/catalog.service";

export function useSearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? "1");

  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!q) {
      setItems([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    catalogService
      .search(q, page, 12)
      .then((res) => {
        setItems(res.data.items ?? []);
        setTotal(res.data.total ?? 0);
        setError(null);
      })
      .catch(() => {
        setItems([]);
        setTotal(0);
        setError("Search is unavailable right now — please try again shortly.");
      })
      .finally(() => setLoading(false));
  }, [q, page]);

  const setPage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(nextPage));
    setSearchParams(next);
  };

  return { q, items, total, page, pageSize: 12, setPage, loading, error };
}
