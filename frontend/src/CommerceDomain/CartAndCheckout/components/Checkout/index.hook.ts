import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Address, Cart } from "@/Common/types/entities";
import { cartService } from "../../service/cart.service";
import { checkoutService } from "../../service/checkout.service";
import { customerService } from "@/FoundationalService/CustomerAccountManagement/service/customer.service";
import { useAuth } from "@/Common/hooks/useAuth";
import { useAppDispatch } from "@/Common/hooks/useAppRedux";
import { cartCleared } from "@/redux/cartSlice";
import { getErrorMessage } from "@/Common/types/api";
import { guestAddressSchema, guestEmailSchema } from "../../validators/Checkout";

export type CheckoutStep = "address" | "payment" | "review";

const emptyGuestAddress = { line1: "", line2: "", city: "", state: "", pincode: "", phone: "" };

export function useCheckout() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();

  const [step, setStep] = useState<CheckoutStep>("address");
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [guestAddress, setGuestAddress] = useState(emptyGuestAddress);
  const [guestEmail, setGuestEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking" | "cod">("upi");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    cartService
      .getCart()
      .then((res) => setCart(res.data))
      .catch(() => setCart(null))
      .finally(() => setLoading(false));

    if (isAuthenticated) {
      customerService
        .listAddresses()
        .then((res) => {
          setAddresses(res.data ?? []);
          const def = res.data?.find((a) => a.isDefault) ?? res.data?.[0];
          if (def) setSelectedAddressId(def.id);
        })
        .catch(() => setAddresses([]));
    }
  }, [isAuthenticated]);

  const setGuestField = (key: keyof typeof emptyGuestAddress, value: string) =>
    setGuestAddress((a) => ({ ...a, [key]: value }));

  const goToPayment = () => {
    if (isAuthenticated) {
      if (!selectedAddressId) {
        toast.error("Select a delivery address");
        return;
      }
    } else {
      const parsed = guestAddressSchema.safeParse(guestAddress);
      const emailParsed = guestEmailSchema.safeParse(guestEmail);
      const fieldErrors: Record<string, string> = {};
      if (!parsed.success) parsed.error.issues.forEach((i) => (fieldErrors[String(i.path[0])] = i.message));
      if (!emailParsed.success) fieldErrors.guestEmail = emailParsed.error.issues[0].message;
      if (Object.keys(fieldErrors).length) {
        setErrors(fieldErrors);
        return;
      }
      setErrors({});
    }
    setStep("payment");
  };

  const goToReview = () => setStep("review");

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const res = await checkoutService.checkout({
        addressId: isAuthenticated ? selectedAddressId ?? undefined : undefined,
        address: isAuthenticated ? undefined : guestAddress,
        guestEmail: isAuthenticated ? undefined : guestEmail
      });
      dispatch(cartCleared());
      toast.success("Order placed!");
      navigate(`/order-confirmation/${res.data.orderId}`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't place your order — please try again."));
    } finally {
      setPlacing(false);
    }
  };

  return {
    step,
    setStep,
    cart,
    loading,
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    guestAddress,
    setGuestField,
    guestEmail,
    setGuestEmail,
    errors,
    isAuthenticated,
    paymentMethod,
    setPaymentMethod,
    goToPayment,
    goToReview,
    placeOrder,
    placing
  };
}
