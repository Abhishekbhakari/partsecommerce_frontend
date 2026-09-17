import { Plus, Search, Pencil, Archive } from "lucide-react";
import { useSellerProductList } from "./index.hook";
import { formatMoney } from "@/Common/lib/utils";
import type { ProductSummary } from "@/Common/types/entities";
import { Button } from "@/Common/components/ui/button";
import { Input } from "@/Common/components/ui/input";
import { Badge } from "@/Common/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/Common/components/ui/data-table";
import { Pagination } from "@/Common/components/ui/pagination";

export default function SellerProductList() {
  const { items, total, page, pageSize, setPage, search, setSearch, loading, handleDelete, goToCreate, goToEdit } =
    useSellerProductList();

  const columns: DataTableColumn<ProductSummary>[] = [
    {
      key: "title",
      header: "Product",
      render: (p) => (
        <div>
          <p className="font-semibold">{p.title}</p>
          <p className="text-xs text-muted-foreground">SKU {p.sku}</p>
        </div>
      )
    },
    { key: "category", header: "Category", render: (p) => p.category?.name ?? "—" },
    { key: "basePrice", header: "Price", render: (p) => formatMoney(p.basePrice) },
    {
      key: "status",
      header: "Status",
      render: (p) => (
        <Badge variant={p.status === "active" ? "success" : p.status === "draft" ? "secondary" : "outline"}>{p.status}</Badge>
      )
    },
    {
      key: "actions",
      header: "",
      render: (p) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => goToEdit(p.slug)} aria-label="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} aria-label="Archive">
            <Archive className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold">My Products</h1>
          <p className="text-sm text-muted-foreground">{total} products listed</p>
        </div>
        <Button onClick={goToCreate}>
          <Plus className="h-4 w-4" /> New Product
        </Button>
      </div>

      <div className="relative mt-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by title, SKU, part number…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="mt-4">
        <DataTable columns={columns} rows={items} rowKey={(p) => p.id} loading={loading} emptyMessage="No products listed yet." />
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} className="mt-4" />
      </div>
    </div>
  );
}
