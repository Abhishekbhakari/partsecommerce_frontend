import { Link } from "react-router-dom";
import { ShieldCheck, Truck, Headphones } from "lucide-react";
import { useHome } from "./index.hook";
import HeroCarousel from "./HeroCarousel";
import FitmentFinder from "../FitmentFinder";
import { ProductCard } from "@/Common/components/ProductCard";
import { Spinner } from "@/Common/components/ui/spinner";

export default function Home() {
  const { categories, featured, loading, error } = useHome();

  return (
    <div className="flex flex-col">
      <HeroCarousel />

      {/* Fitment finder floats up over the carousel's bottom edge as an elevated card — the
          same "search widget overlapping the hero" pattern travel/marketplace giants use so
          the single most useful action on the page reads as unmissable, not buried below. */}
      <section className="container -mt-8 sm:-mt-10">
        <div className="rounded-2xl bg-card p-4 shadow-raised sm:p-6">
          <p className="mb-3 text-sm font-bold text-foreground">Find parts for your vehicle</p>
          <FitmentFinder variant="inline" />
        </div>
      </section>

      <section className="border-b border-border">
        <div className="container grid grid-cols-3 gap-4 py-8 text-center text-xs font-semibold sm:text-sm">
          <div className="flex flex-col items-center gap-1.5">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Genuine Parts Guarantee
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Truck className="h-5 w-5 text-primary" />
            Pan-India Fast Shipping
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Headphones className="h-5 w-5 text-primary" />
            Expert Fitment Support
          </div>
        </div>
      </section>

      <section className="container py-8 sm:py-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold sm:text-2xl">Shop by Category</h2>
        </div>
        {loading ? (
          <Spinner />
        ) : categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">{error ?? "No categories yet."}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.slice(0, 12).map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 text-center transition-shadow hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt="" className="h-8 w-8 object-contain" />
                  ) : (
                    <span className="text-lg font-bold">{cat.name[0]}</span>
                  )}
                </div>
                <span className="text-xs font-semibold">{cat.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="container pb-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold sm:text-2xl">Featured Products</h2>
          <Link to="/products" className="text-sm font-semibold text-primary hover:underline">
            View all
          </Link>
        </div>
        {loading ? (
          <Spinner />
        ) : featured.length === 0 ? (
          <p className="text-sm text-muted-foreground">{error ?? "No products yet — check back soon."}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
