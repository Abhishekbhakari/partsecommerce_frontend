import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { useProductListing } from "./index.hook";
import { ProductCard } from "@/Common/components/ProductCard";
import { Select } from "@/Common/components/ui/select";
import { Input } from "@/Common/components/ui/input";
import { Button } from "@/Common/components/ui/button";
import { Spinner } from "@/Common/components/ui/spinner";
import { Pagination } from "@/Common/components/ui/pagination";
import { Breadcrumb } from "@/Common/components/ui/breadcrumb";

const SORT_OPTIONS = [
  { label: "Most Popular", value: "popular" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest", value: "newest" },
  { label: "Top Rated", value: "rating" }
];

export default function ProductListing() {
  const { items, total, pageSize, page, categories, brands, filters, updateFilter, setPage, clearFilters, loading, error } =
    useProductListing();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilterCount = [filters.category, filters.brand, filters.priceMin, filters.priceMax].filter(Boolean).length;

  const FilterPanel = (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Category</p>
        <Select
          placeholder="All categories"
          value={filters.category}
          onChange={(e) => updateFilter("category", e.target.value)}
          options={categories.map((c) => ({ label: c.name, value: c.slug }))}
        />
      </div>
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Brand</p>
        <Select
          placeholder="All brands"
          value={filters.brand}
          onChange={(e) => updateFilter("brand", e.target.value)}
          options={brands.map((b) => ({ label: b.name, value: b.slug }))}
        />
      </div>
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Price Range (₹)</p>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.priceMin}
            onChange={(e) => updateFilter("priceMin", e.target.value)}
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            placeholder="Max"
            value={filters.priceMax}
            onChange={(e) => updateFilter("priceMax", e.target.value)}
          />
        </div>
      </div>
      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="self-start">
          <X className="h-3.5 w-3.5" /> Clear filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="container py-6">
      <Breadcrumb items={[{ label: "Shop All" }]} />
      <div className="mt-3 flex items-center justify-between">
        <h1 className="text-xl font-extrabold sm:text-2xl">Shop All Parts</h1>
        <button
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-semibold lg:hidden"
          onClick={() => setFiltersOpen(true)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-lg border border-border bg-card p-4">{FilterPanel}</div>
        </aside>

        {filtersOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setFiltersOpen(false)} />
            <div className="relative ml-auto h-full w-[85%] max-w-sm overflow-y-auto bg-background p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-lg font-bold">Filters</p>
                <button onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {FilterPanel}
              <Button className="mt-6 w-full" onClick={() => setFiltersOpen(false)}>
                Show {total} results
              </Button>
            </div>
          </div>
        )}

        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{loading ? "Loading…" : `${total} results`}</p>
            <div className="w-48">
              <Select
                value={filters.sort}
                onChange={(e) => updateFilter("sort", e.target.value)}
                options={SORT_OPTIONS}
              />
            </div>
          </div>

          {loading ? (
            <Spinner />
          ) : items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-16 text-center">
              <p className="font-semibold">{error ?? "No products match these filters."}</p>
              {!error && (
                <Button variant="link" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} className="mt-8" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
