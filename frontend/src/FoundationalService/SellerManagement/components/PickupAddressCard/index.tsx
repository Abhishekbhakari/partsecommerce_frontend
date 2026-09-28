import { MapPin } from "lucide-react";
import { usePickupAddress } from "./index.hook";
import { Card, CardContent } from "@/Common/components/ui/card";
import { Input } from "@/Common/components/ui/input";
import { Label } from "@/Common/components/ui/label";
import { Button } from "@/Common/components/ui/button";

/** Warehouse / pickup address for courier collection. Shipping is priced per seller from this
 * pincode to the buyer's, so keeping it accurate directly affects what buyers are charged. */
export default function PickupAddressCard() {
  const { form, setField, errors, loading, saving, saved, handleSubmit } = usePickupAddress();

  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <p className="flex items-center gap-1.5 font-semibold">
          <MapPin className="h-4 w-4 text-primary" /> Pickup address
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Where the courier collects your parcels. Buyers' delivery charges are calculated from this pincode
          {saved ? "." : " — until you set it, shipping is estimated from a default location."}
        </p>

        {!loading && (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <Label>Address line 1</Label>
              <Input value={form.line1} onChange={(e) => setField("line1", e.target.value)} error={errors.line1} />
              {errors.line1 && <p className="mt-1 text-xs text-destructive">{errors.line1}</p>}
            </div>
            <div>
              <Label>Address line 2 (optional)</Label>
              <Input value={form.line2} onChange={(e) => setField("line2", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => setField("city", e.target.value)} error={errors.city} />
                {errors.city && <p className="mt-1 text-xs text-destructive">{errors.city}</p>}
              </div>
              <div>
                <Label>State</Label>
                <Input value={form.state} onChange={(e) => setField("state", e.target.value)} error={errors.state} />
                {errors.state && <p className="mt-1 text-xs text-destructive">{errors.state}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Pincode</Label>
                <Input value={form.pincode} maxLength={6} inputMode="numeric" onChange={(e) => setField("pincode", e.target.value)} error={errors.pincode} />
                {errors.pincode && <p className="mt-1 text-xs text-destructive">{errors.pincode}</p>}
              </div>
              <div>
                <Label>Pickup contact phone</Label>
                <Input value={form.phone} onChange={(e) => setField("phone", e.target.value)} error={errors.phone} />
                {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <Button type="submit" loading={saving}>
                Save pickup address
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
