import { Link } from "react-router-dom";
import { Trash2, ShoppingCart } from "lucide-react";
import { useWishlist } from "./index.hook";
import { formatMoney } from "@/Common/lib/utils";
import { Button } from "@/Common/components/ui/button";
import { Card, CardContent } from "@/Common/components/ui/card";
import { Spinner } from "@/Common/components/ui/spinner";
import { EmptyState } from "@/Common/components/EmptyState";
import { EmptyWishlistIllustration } from "@/Common/components/EmptyState/illustrations";

export default function Wishlist() {
  const { items, loading, pendingId, remove, addToCart } = useWishlist();

  if (loading) return <Spinner />;

  if (items.length === 0) {
    return (
      <EmptyState
        illustration={<EmptyWishlistIllustration />}
        title="Your wishlist is empty"
        description="Save parts you're interested in and they'll show up here."
        action={
          <Link to="/products">
            <Button>Browse Products</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((p) => (
        <Card key={p.id}>
          <CardContent className="flex gap-3 p-3">
            <Link to={`/products/${p.slug}`} className="shrink-0">
              {p.images?.[0] ? (
                <img src={p.images[0]} alt={p.title} className="h-20 w-20 rounded-md object-cover" />
              ) : (
                <div className="h-20 w-20 rounded-md bg-muted" />
              )}
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <Link to={`/products/${p.slug}`} className="line-clamp-2 text-sm font-semibold hover:text-primary">
                {p.title}
              </Link>
              <p className="mt-1 font-bold">{formatMoney(p.basePrice)}</p>
              <div className="mt-auto flex items-center gap-2 pt-2">
                <Button size="sm" onClick={() => addToCart(p)} loading={pendingId === p.id}>
                  <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
                </Button>
                <Button size="sm" variant="ghost" aria-label="Remove from wishlist" onClick={() => remove(p.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
