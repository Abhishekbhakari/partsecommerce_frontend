import { Check, MapPin, CreditCard, ClipboardCheck } from "lucide-react";
import { useCheckout, type CheckoutStep } from "./index.hook";
import { cn, formatMoney } from "@/Common/lib/utils";
import { Input } from "@/Common/components/ui/input";
import { Label } from "@/Common/components/ui/label";
import { Button } from "@/Common/components/ui/button";
import { Card, CardContent } from "@/Common/components/ui/card";
import { Spinner } from "@/Common/components/ui/spinner";

const STEPS: { key: CheckoutStep; label: string; icon: typeof MapPin }[] = [
  { key: "address", label: "Address", icon: MapPin },
  { key: "payment", label: "Payment", icon: CreditCard },
  { key: "review", label: "Review", icon: ClipboardCheck }
];

const PAYMENT_METHODS = [
  { value: "upi", label: "UPI" },
  { value: "card", label: "Credit / Debit Card" },
  { value: "netbanking", label: "Net Banking" },
  { value: "cod", label: "Cash on Delivery" }
] as const;

export default function Checkout() {
  const {
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
  } = useCheckout();

  if (loading) return <Spinner />;

  if (!cart || cart.items.length === 0) {
    return <p className="container py-16 text-center text-sm text-muted-foreground">Your cart is empty.</p>;
  }

  return (
    <div className="container py-6">
      <h1 className="text-xl font-extrabold sm:text-2xl">Checkout</h1>

      <div className="mt-5 flex items-center gap-2">
        {STEPS.map((s, i) => {
          const currentIndex = STEPS.findIndex((x) => x.key === step);
          const done = i < currentIndex;
          const active = s.key === step;
          return (
            <div key={s.key} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  done ? "bg-success text-success-foreground" : active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={cn("hidden text-sm font-semibold sm:inline", active ? "text-foreground" : "text-muted-foreground")}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && <div className="h-px flex-1 bg-border" />}
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          {step === "address" && (
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-4 font-bold">Delivery Address</h2>
                {isAuthenticated ? (
                  addresses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No saved addresses — add one from your account before checking out.</p>
                  ) : (
                    <div className="space-y-2">
                      {addresses.map((addr) => (
                        <label
                          key={addr.id}
                          className={cn(
                            "flex cursor-pointer gap-3 rounded-md border p-3 text-sm",
                            selectedAddressId === addr.id ? "border-primary bg-primary/5" : "border-border"
                          )}
                        >
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="mt-1"
                          />
                          <div>
                            <p className="font-semibold">{addr.label}</p>
                            <p className="text-muted-foreground">
                              {addr.line1}, {addr.city}, {addr.state} {addr.pincode}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label>Email (for order updates)</Label>
                      <Input value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} error={errors.guestEmail} />
                      {errors.guestEmail && <p className="mt-1 text-xs text-destructive">{errors.guestEmail}</p>}
                    </div>
                    <div>
                      <Label>Address Line 1</Label>
                      <Input value={guestAddress.line1} onChange={(e) => setGuestField("line1", e.target.value)} error={errors.line1} />
                    </div>
                    <div>
                      <Label>Address Line 2 (optional)</Label>
                      <Input value={guestAddress.line2} onChange={(e) => setGuestField("line2", e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>City</Label>
                        <Input value={guestAddress.city} onChange={(e) => setGuestField("city", e.target.value)} error={errors.city} />
                      </div>
                      <div>
                        <Label>State</Label>
                        <Input value={guestAddress.state} onChange={(e) => setGuestField("state", e.target.value)} error={errors.state} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Pincode</Label>
                        <Input value={guestAddress.pincode} onChange={(e) => setGuestField("pincode", e.target.value)} error={errors.pincode} maxLength={6} />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input value={guestAddress.phone} onChange={(e) => setGuestField("phone", e.target.value)} error={errors.phone} />
                      </div>
                    </div>
                  </div>
                )}
                <Button className="mt-5 w-full" onClick={goToPayment}>
                  Continue to Payment
                </Button>
              </CardContent>
            </Card>
          )}

          {step === "payment" && (
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-4 font-bold">Payment Method</h2>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map((m) => (
                    <label
                      key={m.value}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm font-medium",
                        paymentMethod === m.value ? "border-primary bg-primary/5" : "border-border"
                      )}
                    >
                      <input type="radio" name="payment" checked={paymentMethod === m.value} onChange={() => setPaymentMethod(m.value)} />
                      {m.label}
                    </label>
                  ))}
                </div>
                <div className="mt-5 flex gap-3">
                  <Button variant="outline" onClick={() => setStep("address")}>
                    Back
                  </Button>
                  <Button className="flex-1" onClick={goToReview}>
                    Review Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === "review" && (
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-4 font-bold">Review &amp; Place Order</h2>
                <div className="divide-y divide-border">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex justify-between py-2 text-sm">
                      <span>
                        {item.product?.title ?? "Item"} × {item.qty}
                      </span>
                      <span className="font-semibold">{formatMoney(item.priceAtAdd * item.qty)}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Paying via <span className="font-semibold capitalize text-foreground">{paymentMethod.toUpperCase()}</span>
                </p>
                <div className="mt-5 flex gap-3">
                  <Button variant="outline" onClick={() => setStep("payment")}>
                    Back
                  </Button>
                  <Button className="flex-1" loading={placing} onClick={placeOrder}>
                    Place Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="h-fit lg:sticky lg:top-20">
          <CardContent className="space-y-2 p-4 text-sm">
            <p className="mb-2 font-semibold">Order Summary</p>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatMoney(cart.subtotal)}</span>
            </div>
            {cart.discount > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount</span>
                <span>-{formatMoney(cart.discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2 text-base font-extrabold">
              <span>Total</span>
              <span>{formatMoney(cart.total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
