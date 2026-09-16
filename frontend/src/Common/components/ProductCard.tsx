import { Link } from "react-router-dom";
import { Star, PackageCheck, PackageX } from "lucide-react";
import type { ProductSummary } from "@/Common/types/entities";
import { formatMoney, cn } from "@/Common/lib/utils";
import { Badge } from "@/Common/components/ui/badge";

/** Product tile reused across Home, ProductListing, SearchResults, and PDP's related-products
 * rail — one canonical card look for the storefront. */
export function ProductCard({ product, className }: { product: ProductSummary; className?: string }) {
  return (
    <Link
      to={`/products/${product.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-secondary">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">No image</div>
        )}
        {product.brand?.name && (
          <Badge variant="secondary" className="absolute left-2 top-2 bg-white/90">
            {product.brand.name}
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        {product.partNumber && <p className="text-[11px] font-medium uppercase text-muted-foreground">Part# {product.partNumber}</p>}
        <p className="line-clamp-2 text-sm font-semibold text-foreground">{product.title}</p>
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
            {product.avgRating.toFixed(1)} ({product.reviewCount})
          </div>
        )}
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="text-base font-extrabold text-foreground">{formatMoney(product.basePrice)}</span>
          {product.inStock === false ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-destructive">
              <PackageX className="h-3.5 w-3.5" /> Out of stock
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-semibold text-success">
              <PackageCheck className="h-3.5 w-3.5" /> In stock
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
