import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import type { ProductSummary } from "@/Common/types/entities";
import { customerService } from "../../service/customer.service";
import { catalogService } from "@/CommerceDomain/CatalogManagement/service/catalog.service";
import { cartService } from "@/CommerceDomain/CartAndCheckout/service/cart.service";
import { cartSynced } from "@/redux/cartSlice";
import { getErrorMessage } from "@/Common/types/api";

/** Customer-facing wishlist page — list, remove, add-to-cart, per docs/PHASE2_ADDENDUM.md §5.
 * `customerService.listWishlist/addToWishlist/removeFromWishlist` already existed
 * (`GET/POST/DELETE /me/wishlist(/:productId)`), just had no page wired up. */
export function useWishlist() {
  const [items, setItems] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const dispatch = useDispatch();

  const load = () => {
    setLoading(true);
    customerService
      .listWishlist()
      .then((res) => setItems(res.data ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (productId: number) => {
    setItems((prev) => prev.filter((p) => p.id !== productId));
    try {
      await customerService.removeFromWishlist(productId);
    } catch {
      toast.error("Couldn't remove this item — refreshing your wishlist.");
      load();
    }
  };

  /** ProductSummary has no variant info, so resolve the product's first (default) variant before
   * adding — matches how most catalog items only have a single "Standard" variant. */
  const addToCart = async (product: ProductSummary) => {
    setPendingId(product.id);
    try {
      const full = await catalogService.getProductBySlug(product.slug);
      const variant = full.data?.variants?.[0];
      if (!variant) throw new Error("No purchasable variant for this product.");
      const res = await cartService.addItem(variant.id, 1);
      dispatch(cartSynced(res.data));
      toast.success("Added to cart");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't add this item to your cart."));
    } finally {
      setPendingId(null);
    }
  };

  return { items, loading, pendingId, remove, addToCart };
}
