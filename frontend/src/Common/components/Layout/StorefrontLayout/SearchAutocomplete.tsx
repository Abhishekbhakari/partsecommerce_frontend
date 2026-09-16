import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { catalogService } from "@/CommerceDomain/CatalogManagement/service/catalog.service";
import { useDebouncedValue } from "@/Common/hooks/useDebouncedValue";
import type { ProductSummary } from "@/CommerceDomain/CatalogManagement/types/catalog.types";

interface SearchAutocompleteProps {
  placeholder: string;
  inputClassName: string;
}

/** Debounced live-suggestions dropdown under the header search box, used by both the desktop and
 * mobile search rows in StorefrontHeader — wraps `catalogService.autocomplete`
 * (`GET /search/autocomplete`, returns `{ suggestions: string[], products: ProductSummary[] }`). */
export function SearchAutocomplete({ placeholder, inputClassName }: SearchAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const debouncedQuery = useDebouncedValue(query, 300);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setProducts([]);
      return;
    }
    let cancelled = false;
    catalogService
      .autocomplete(q)
      .then((res) => {
        if (cancelled) return;
        setSuggestions(res.data?.suggestions ?? []);
        setProducts(res.data?.products ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          setSuggestions([]);
          setProducts([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const goToSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const showDropdown = open && query.trim().length >= 2 && (suggestions.length > 0 || products.length > 0);

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          goToSearch(query);
        }}
      >
        <div className="relative">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className={inputClassName}
            autoComplete="off"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label="Search">
            <Search className="h-4 w-4" />
          </button>
        </div>
      </form>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-96 overflow-auto rounded-md border border-border bg-card text-foreground shadow-lg">
          {suggestions.length > 0 && (
            <ul>
              {suggestions.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => goToSearch(s)}
                  >
                    <Search className="h-3.5 w-3.5 text-muted-foreground" />
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {products.length > 0 && (
            <ul className="border-t border-border">
              {products.slice(0, 6).map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => {
                      setOpen(false);
                      navigate(`/products/${p.slug}`);
                    }}
                  >
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt="" className="h-8 w-8 rounded object-cover" />
                    ) : (
                      <span className="h-8 w-8 rounded bg-muted" />
                    )}
                    <span className="line-clamp-1">{p.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
