import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { User } from "@/Common/types/entities";
import { adminCustomerService } from "../../service/customer.service";
import { useDebouncedValue } from "@/Common/hooks/useDebouncedValue";

const PAGE_SIZE = 20;

export function useAdminCustomerList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1");
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const debouncedSearch = useDebouncedValue(search, 400);

  const [items, setItems] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminCustomerService
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

  const setPage = (next: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(next));
    setSearchParams(params);
  };

  return { items, total, page, pageSize: PAGE_SIZE, setPage, search, setSearch, loading };
}
