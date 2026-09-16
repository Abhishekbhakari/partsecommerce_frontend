import { Star, Minus, Plus, ShoppingCart, CheckCircle2 } from "lucide-react";
import { useProductDetail } from "./index.hook";
import { formatMoney, cn } from "@/Common/lib/utils";
import { Button } from "@/Common/components/ui/button";
import { Badge } from "@/Common/components/ui/badge";
import { Spinner } from "@/Common/components/ui/spinner";
import { Breadcrumb } from "@/Common/components/ui/breadcrumb";

export default function ProductDetail() {
  const {
    product,
    selectedVariant,
    setSelectedVariant,
    qty,
    setQty,
    activeImage,
    setActiveImage,
    activeTab,
    setActiveTab,
    loading,
    error,
    addingToCart,
    handleAddToCart
  } = useProductDetail();

  if (loading) return <Spinner />;

  if (!product) {
    return (
      <div className="container py-16 text-center">
        <p className="text-lg font-semibold">{error ?? "Product not found."}</p>
      </div>
    );
  }

  const price = product.basePrice + (selectedVariant?.priceDelta ?? 0);
  const inStock = (selectedVariant?.stock ?? 0) > 0;

  return (
    <div className="container py-6">
      <Breadcrumb items={[{ label: "Shop All", to: "/products" }, { label: product.title }]} />

      <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <div className="aspect-square w-full overflow-hidden rounded-lg border border-border bg-secondary">
            {product.images?.[activeImage] ? (
              <img src={product.images[activeImage]} alt={product.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No image</div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "h-16 w-16 shrink-0 overflow-hidden rounded-md border-2",
                    activeImage === i ? "border-primary" : "border-border"
                  )}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.brand?.name && <Badge variant="secondary">{product.brand.name}</Badge>}
          <h1 className="mt-2 text-2xl font-extrabold leading-tight sm:text-3xl">{product.title}</h1>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {product.reviewCount > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-accent text-accent" />
                {product.avgRating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            )}
            {product.partNumber && <span>Part# {product.partNumber}</span>}
            {product.oemNumber && <span>OEM# {product.oemNumber}</span>}
          </div>

          <p className="mt-4 text-3xl font-extrabold">{formatMoney(price)}</p>
          <p className="text-xs text-muted-foreground">Inclusive of {product.gstRate}% GST</p>

          {product.variants?.length > 1 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Variant</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm font-semibold",
                      selectedVariant?.id === v.id ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-secondary"
                    )}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 text-sm font-semibold">
            {inStock ? (
              <span className="flex items-center gap-1 text-success">
                <CheckCircle2 className="h-4 w-4" /> In stock ({selectedVariant?.stock} available)
              </span>
            ) : (
              <span className="text-destructive">Out of stock</span>
            )}
          </div>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex items-center rounded-md border border-input">
              <button className="p-2.5" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-semibold">{qty}</span>
              <button className="p-2.5" onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button size="lg" className="flex-1" disabled={!inStock} loading={addingToCart} onClick={handleAddToCart}>
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex gap-6 border-b border-border">
          {(["specs", "fitment", "reviews"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "border-b-2 px-1 py-3 text-sm font-semibold capitalize",
                activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground"
              )}
            >
              {tab === "fitment" ? "Fitment Compatibility" : tab}
            </button>
          ))}
        </div>

        <div className="py-5">
          {activeTab === "specs" && (
            <p className="max-w-3xl whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {product.description || "No description provided yet."}
            </p>
          )}
          {activeTab === "fitment" && (
            <div className="overflow-x-auto">
              {product.fitment?.length ? (
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead className="text-xs font-bold uppercase text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-4">Make</th>
                      <th className="py-2 pr-4">Model</th>
                      <th className="py-2 pr-4">Years</th>
                      <th className="py-2">Variant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {product.fitment.map((f) => (
                      <tr key={f.id}>
                        <td className="py-2 pr-4 font-medium">{f.make}</td>
                        <td className="py-2 pr-4">{f.model}</td>
                        <td className="py-2 pr-4">
                          {f.yearFrom}–{f.yearTo}
                        </td>
                        <td className="py-2">{f.variant ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-muted-foreground">No fitment data listed for this product yet.</p>
              )}
            </div>
          )}
          {activeTab === "reviews" && (
            <p className="text-sm text-muted-foreground">
              {product.reviewCount > 0 ? `${product.reviewCount} reviews · avg ${product.avgRating.toFixed(1)}★` : "No reviews yet."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
