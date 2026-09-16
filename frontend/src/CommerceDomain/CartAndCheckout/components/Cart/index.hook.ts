import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Cart } from "@/Common/types/entities";
import { cartService } from "../../service/cart.service";
import { useAppDispatch } from "@/Common/hooks/useAppRedux";
import { cartSynced } from "@/redux/cartSlice";
import { getErrorMessage } from "@/Common/types/api";

export function useCart() {
  const dispatch = useAppDispatch();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [pincode, setPincode] = useState("");
  const [pincodeResult, setPincodeResult] = useState<{ serviceable: boolean; etaDays: number; shippingFee: number } | null>(null);
  const [checkingPincode, setCheckingPincode] = useState(false);

  const load = () => {
    setLoading(true);
    cartService
      .getCart()
      .then((res) => {
        setCart(res.data);
        dispatch(cartSynced(res.data));
      })
      .catch(() => setCart(null))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateQty = async (itemId: number, qty: number) => {
    if (qty < 1) return;
    try {
      const res = await cartService.updateItem(itemId, qty);
      setCart(res.data);
      dispatch(cartSynced(res.data));
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't update quantity."));
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      const res = await cartService.removeItem(itemId);
      setCart(res.data);
      dispatch(cartSynced(res.data));
      toast.success("Item removed");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't remove item."));
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await cartService.applyCoupon(couponCode.trim());
      setCart(res.data);
      dispatch(cartSynced(res.data));
      toast.success("Coupon applied");
    } catch (err) {
      toast.error(getErrorMessage(err, "Invalid or expired coupon."));
    }
  };

  const removeCoupon = async () => {
    try {
      const res = await cartService.removeCoupon();
      setCart(res.data);
      dispatch(cartSynced(res.data));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const checkPincode = async () => {
    if (!/^\d{6}$/.test(pincode)) {
      toast.error("Enter a valid 6-digit pincode");
      return;
    }
    setCheckingPincode(true);
    try {
      const res = await cartService.checkPincode(pincode);
      setPincodeResult(res.data);
    } catch {
      setPincodeResult(null);
      toast.error("Couldn't check serviceability right now.");
    } finally {
      setCheckingPincode(false);
    }
  };

  return {
    cart,
    loading,
    updateQty,
    removeItem,
    couponCode,
    setCouponCode,
    applyCoupon,
    removeCoupon,
    pincode,
    setPincode,
    pincodeResult,
    checkingPincode,
    checkPincode
  };
}
