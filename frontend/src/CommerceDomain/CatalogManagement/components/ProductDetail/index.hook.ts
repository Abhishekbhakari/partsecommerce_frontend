import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import type { Product, ProductVariant } from "@/Common/types/entities";
import { catalogService } from "../../service/catalog.service";
import { cartService } from "@/CommerceDomain/CartAndCheckout/service/cart.service";
import { useAppDispatch } from "@/Common/hooks/useAppRedux";
import { cartSynced } from "@/redux/cartSlice";
import { getErrorMessage } from "@/Common/types/api";

export function useProductDetail() {
  const { slug = "" } = useParams();
  const dispatch = useAppDispatch();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"specs" | "fitment" | "reviews">("specs");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    catalogService
      .getProductBySlug(slug)
      .then((res) => {
        setProduct(res.data);
        setSelectedVariant(res.data.variants?.[0] ?? null);
        setError(null);
      })
      .catch(() => {
        setProduct(null);
        setError("This product couldn't be loaded — it may be unavailable or the catalog API isn't reachable yet.");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error("Please select a variant first");
      return;
    }
    setAddingToCart(true);
    try {
      const res = await cartService.addItem(selectedVariant.id, qty);
      dispatch(cartSynced(res.data));
      toast.success("Added to cart");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't add to cart — please try again."));
    } finally {
      setAddingToCart(false);
    }
  };

  return {
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
  };
}
