import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Truck, Headphones } from "lucide-react";
import { useHome } from "./index.hook";
import FitmentFinder from "../FitmentFinder";
import { ProductCard } from "@/Common/components/ProductCard";
import { Spinner } from "@/Common/components/ui/spinner";
import { Button } from "@/Common/components/ui/button";

export default function Home() {
  const { categories, featured, loading, error } = useHome();

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-br from-primary to-[hsl(214,60%,14%)] text-primary-foreground">
        <div className="container grid grid-cols-1 items-center gap-8 py-10 sm:py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-accent">Genuine Parts, Right Fit</p>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
              5,000+ spare parts, verified for your exact vehicle.
            </h1>
            <p className="mt-4 max-w-lg text-sm text-primary-foreground/80 sm:text-base">
              Skip the guesswork. Search by part number, OEM code, or your vehicle's make, model, and year — every listing
              shows verified fitment before you buy.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/products">
                <Button variant="accent" size="lg">
                  Shop All Parts
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/fitment-finder">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
                >
                  Find Parts for My Vehicle
                </Button>
              </Link>
            </div>
          </div>
          <FitmentFinder />
        </div>
      </section>

      <section className="border-b border-border bg-secondary/50">
        <div className="container grid grid-cols-3 gap-4 py-6 text-center text-xs font-semibold sm:text-sm">
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
