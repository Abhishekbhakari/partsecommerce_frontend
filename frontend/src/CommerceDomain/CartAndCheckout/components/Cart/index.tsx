import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, MapPin, Tag } from "lucide-react";
import { useCart } from "./index.hook";
import { formatMoney } from "@/Common/lib/utils";
import { Button } from "@/Common/components/ui/button";
import { Input } from "@/Common/components/ui/input";
import { Spinner } from "@/Common/components/ui/spinner";
import { Card, CardContent } from "@/Common/components/ui/card";
import { EmptyState } from "@/Common/components/EmptyState";
import { EmptyCartIllustration } from "@/Common/components/EmptyState/illustrations";

export default function Cart() {
  const {
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
  } = useCart();

  if (loading) return <Spinner />;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container py-6">
        <EmptyState
          illustration={<EmptyCartIllustration />}
          title="Your cart is empty"
          description="Browse our catalog to find the parts you need."
          action={
            <Link to="/products">
              <Button>Shop All Parts</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container py-6 pb-28 md:pb-6">
      <h1 className="text-xl font-extrabold sm:text-2xl">Your Cart ({cart.items.length})</h1>

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-3">
          {cart.items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex gap-3 p-3 sm:p-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-secondary">
                  {item.product?.images?.[0] && <img src={item.product.images[0]} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">{item.product?.title ?? "Product"}</p>
                    <button onClick={() => removeItem(item.id)} aria-label="Remove item" className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {item.variant?.name && <p className="text-xs text-muted-foreground">{item.variant.name}</p>}
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex items-center rounded-md border border-input">
                      <button className="p-1.5" onClick={() => updateQty(item.id, item.qty - 1)} aria-label="Decrease quantity">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-7 text-center text-sm font-semibold">{item.qty}</span>
                      <button className="p-1.5" onClick={() => updateQty(item.id, item.qty + 1)} aria-label="Increase quantity">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="font-bold">{formatMoney(item.priceAtAdd * item.qty)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardContent className="p-4">
              <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                <MapPin className="h-4 w-4" /> Check delivery
              </p>
              <div className="flex gap-2">
                <Input placeholder="Enter 6-digit pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} maxLength={6} />
                <Button variant="outline" onClick={checkPincode} loading={checkingPincode}>
                  Check
                </Button>
              </div>
              {pincodeResult && (
                <p className={`mt-2 text-sm ${pincodeResult.serviceable ? "text-success" : "text-destructive"}`}>
                  {pincodeResult.serviceable
                    ? `Deliverable in ~${pincodeResult.etaDays} day(s) · ${formatMoney(pincodeResult.shippingFee)} shipping`
                    : "Not deliverable to this pincode yet."}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit lg:sticky lg:top-20">
          <CardContent className="p-4 sm:p-5">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
              <Tag className="h-4 w-4" /> Coupon
            </p>
            {cart.couponCode ? (
              <div className="mb-4 flex items-center justify-between rounded-md bg-success/10 px-3 py-2 text-sm">
                <span className="font-semibold text-success">{cart.couponCode} applied</span>
                <button onClick={removeCoupon} className="text-xs font-semibold text-destructive">
                  Remove
                </button>
              </div>
            ) : (
              <div className="mb-4 flex gap-2">
                <Input placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                <Button variant="outline" onClick={applyCoupon}>
                  Apply
                </Button>
              </div>
            )}

            <div className="space-y-2 border-t border-border pt-4 text-sm">
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
            </div>

            <Link to="/checkout" className="hidden md:block">
              <Button className="mt-5 w-full" size="lg">
                Proceed to Checkout
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Mobile sticky order-summary/checkout bar — replaces the bottom tab bar on Cart rather
       * than stacking under it, per design/MOBILE_NAV.md §7. */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-border bg-card px-4 py-3 shadow-nav md:hidden"
        style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
      >
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-extrabold">{formatMoney(cart.total)}</p>
        </div>
        <Link to="/checkout">
          <Button size="lg">Proceed to Checkout</Button>
        </Link>
      </div>
    </div>
  );
}
