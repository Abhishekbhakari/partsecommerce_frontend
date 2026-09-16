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
import { loadRazorpayScript } from "@/Common/lib/razorpay";

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
  /** Set once the order has been created (checkout POST succeeded) so a dismissed/failed Razorpay
   * modal can be retried without re-creating the order or re-decrementing stock. */
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "failed">("idle");

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

  const finishSuccess = (orderId: number) => {
    dispatch(cartCleared());
    toast.success("Order placed!");
    navigate(`/order-confirmation/${orderId}`);
  };

  /** Opens Razorpay Checkout.js for the already-created order, per docs/PHASE2_ADDENDUM.md §5:
   * create-intent → open modal → verify on success → confirmation page. A dismissed/failed modal
   * leaves the order in `pending` (unpaid) and lets the customer retry without re-checkout. */
  const payWithRazorpay = async (orderId: number) => {
    setPaymentStatus("processing");
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error("Couldn't load the payment gateway. Check your connection and try again.");
      setPaymentStatus("failed");
      setPlacing(false);
      return;
    }
    try {
      const intent = await checkoutService.createPaymentIntent(orderId, paymentMethod);
      const { gatewayOrderId, amount, currency, key } = intent.data;
      const razorpay = new window.Razorpay({
        key,
        amount,
        currency,
        name: "PartsHub",
        description: "Spare parts order payment",
        order_id: gatewayOrderId,
        prefill: {
          email: isAuthenticated ? undefined : guestEmail,
          contact: isAuthenticated ? undefined : guestAddress.phone
        },
        theme: { color: "#123B72" },
        handler: async (response) => {
          try {
            await checkoutService.verifyPayment(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
            finishSuccess(orderId);
          } catch (err) {
            toast.error(getErrorMessage(err, "Payment succeeded but verification failed — contact support with your order number."));
            setPaymentStatus("failed");
          } finally {
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled. Your order is saved — you can retry payment.");
            setPaymentStatus("idle");
            setPlacing(false);
          }
        }
      });
      razorpay.open();
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't start the payment. Please try again."));
      setPaymentStatus("failed");
      setPlacing(false);
    }
  };

  const placeOrder = async () => {
    setPlacing(true);
    try {
      let orderId = pendingOrderId;
      if (!orderId) {
        const res = await checkoutService.checkout({
          addressId: isAuthenticated ? selectedAddressId ?? undefined : undefined,
          address: isAuthenticated ? undefined : guestAddress,
          guestEmail: isAuthenticated ? undefined : guestEmail
        });
        orderId = res.data.orderId;
        setPendingOrderId(orderId);
      }

      if (paymentMethod === "cod") {
        await checkoutService.createPaymentIntent(orderId, "cod");
        finishSuccess(orderId);
        setPlacing(false);
        return;
      }

      await payWithRazorpay(orderId);
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't place your order — please try again."));
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
    placing,
    paymentStatus
  };
}
