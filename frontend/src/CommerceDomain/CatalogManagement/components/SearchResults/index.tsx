import { useSearchResults } from "./index.hook";
import { ProductCard } from "@/Common/components/ProductCard";
import { Spinner } from "@/Common/components/ui/spinner";
import { Pagination } from "@/Common/components/ui/pagination";
import { EmptyState } from "@/Common/components/EmptyState";
import { NoSearchResultsIllustration } from "@/Common/components/EmptyState/illustrations";

export default function SearchResults() {
  const { q, items, total, page, pageSize, setPage, loading, error } = useSearchResults();

  return (
    <div className="container py-6">
      <h1 className="text-xl font-extrabold sm:text-2xl">
        {q ? (
          <>
            Search results for <span className="text-primary">&ldquo;{q}&rdquo;</span>
          </>
        ) : (
          "Search"
        )}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{loading ? "Searching…" : `${total} results`}</p>

      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <EmptyState
            illustration={<NoSearchResultsIllustration />}
            title={q ? "No products matched your search" : "Search for a part"}
            description={error ?? (q ? "Try a different keyword, part number, or OEM code." : "Enter a part name, number, or OEM code to search.")}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} className="mt-8" />
          </>
        )}
      </div>
    </div>
  );
}
