import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Order } from "@/Common/types/entities";
import { myOrdersService } from "@/CommerceDomain/CartAndCheckout/service/checkout.service";

const PAGE_SIZE = 10;

export function useOrderHistory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1");
  const [items, setItems] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    myOrdersService
      .list(page, PAGE_SIZE)
      .then((res) => {
        setItems(res.data.items ?? []);
        setTotal(res.data.total ?? 0);
      })
      .catch(() => {
        setItems([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const setPage = (next: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(next));
    setSearchParams(params);
  };

  return { items, total, page, pageSize: PAGE_SIZE, setPage, loading };
}
