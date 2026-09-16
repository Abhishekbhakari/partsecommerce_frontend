import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { ProductSummary } from "@/Common/types/entities";
import { catalogService } from "../service/catalog.service";
import FitmentFinder from "../components/FitmentFinder";
import { ProductCard } from "@/Common/components/ProductCard";
import { Spinner } from "@/Common/components/ui/spinner";
import { Breadcrumb } from "@/Common/components/ui/breadcrumb";

/** Standalone /fitment-finder route: widget at the top, results below once make/model/year are
 * all present in the query string (the widget itself just navigates here with those params). */
export default function FitmentFinderPage() {
  const [searchParams] = useSearchParams();
  const make = searchParams.get("make");
  const model = searchParams.get("model");
  const year = searchParams.get("year");

  const [items, setItems] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!make || !model || !year) {
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    catalogService
      .fitmentLookup(make, model, Number(year))
      .then((res) => setItems(res.data.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [make, model, year]);

  return (
    <div className="container py-6">
      <Breadcrumb items={[{ label: "Fitment Finder" }]} />
      <h1 className="mt-3 text-xl font-extrabold sm:text-2xl">Find Parts for Your Vehicle</h1>
      <p className="mt-1 max-w-xl text-sm text-muted-foreground">
        Select your vehicle's make, model, and year to see every part verified to fit it.
      </p>

      <div className="mt-5">
        <FitmentFinder />
      </div>

      {searched && (
        <div className="mt-8">
          <h2 className="text-lg font-bold">
            Compatible Parts for {make} {model} ({year})
          </h2>
          {loading ? (
            <Spinner />
          ) : items.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No parts found for this vehicle yet — try a different model/year, or check back soon.
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
