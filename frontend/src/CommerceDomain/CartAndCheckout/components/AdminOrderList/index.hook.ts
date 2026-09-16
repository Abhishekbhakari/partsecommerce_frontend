import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Order } from "@/Common/types/entities";
import { adminOrderService } from "../../service/adminOrder.service";
import { useDebouncedValue } from "@/Common/hooks/useDebouncedValue";

const PAGE_SIZE = 20;

export function useAdminOrderList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1");
  const status = searchParams.get("status") ?? "";
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const debouncedSearch = useDebouncedValue(search, 400);

  const [items, setItems] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminOrderService
      .list({ status: status || undefined, q: debouncedSearch || undefined, page, pageSize: PAGE_SIZE })
      .then((res) => {
        setItems(res.data.items ?? []);
        setTotal(res.data.total ?? 0);
      })
      .catch(() => {
        setItems([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [status, debouncedSearch, page]);

  const setPage = (next: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(next));
    setSearchParams(params);
  };

  const setStatus = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set("status", value);
    else params.delete("status");
    params.delete("page");
    setSearchParams(params);
  };

  return { items, total, page, pageSize: PAGE_SIZE, setPage, status, setStatus, search, setSearch, loading };
}
