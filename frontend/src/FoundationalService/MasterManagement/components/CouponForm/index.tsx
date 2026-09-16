import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useCouponForm } from "./index.hook";
import { Input } from "@/Common/components/ui/input";
import { Select } from "@/Common/components/ui/select";
import { Label } from "@/Common/components/ui/label";
import { Button } from "@/Common/components/ui/button";
import { Spinner } from "@/Common/components/ui/spinner";
import { Card, CardContent } from "@/Common/components/ui/card";

export default function CouponForm() {
  const { form, setField, errors, loading, saving, isEdit, handleSubmit } = useCouponForm();

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto max-w-xl">
      <Link to="/admin/coupons" className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Coupons
      </Link>
      <h1 className="text-xl font-extrabold">{isEdit ? "Edit Coupon" : "New Coupon"}</h1>

      <Card className="mt-4">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Code</Label>
                <Input value={form.code} onChange={(e) => setField("code", e.target.value.toUpperCase())} error={errors.code} />
                {errors.code && <p className="mt-1 text-xs text-destructive">{errors.code}</p>}
              </div>
              <div>
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onChange={(e) => setField("type", e.target.value as "percentage" | "flat")}
                  options={[
                    { label: "Percentage", value: "percentage" },
                    { label: "Flat (paise)", value: "flat" }
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{form.type === "percentage" ? "Value (%)" : "Value (paise)"}</Label>
                <Input type="number" value={form.value} onChange={(e) => setField("value", e.target.value)} error={errors.value} />
                {errors.value && <p className="mt-1 text-xs text-destructive">{errors.value}</p>}
              </div>
              <div>
                <Label>Max Discount (paise, optional)</Label>
                <Input type="number" value={form.maxDiscount} onChange={(e) => setField("maxDiscount", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Order Value (paise, optional)</Label>
                <Input type="number" value={form.minOrderValue} onChange={(e) => setField("minOrderValue", e.target.value)} />
              </div>
              <div>
                <Label>Usage Limit (optional)</Label>
                <Input type="number" value={form.usageLimit} onChange={(e) => setField("usageLimit", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valid From</Label>
                <Input type="date" value={form.validFrom} onChange={(e) => setField("validFrom", e.target.value)} error={errors.validFrom} />
                {errors.validFrom && <p className="mt-1 text-xs text-destructive">{errors.validFrom}</p>}
              </div>
              <div>
                <Label>Valid To</Label>
                <Input type="date" value={form.validTo} onChange={(e) => setField("validTo", e.target.value)} error={errors.validTo} />
                {errors.validTo && <p className="mt-1 text-xs text-destructive">{errors.validTo}</p>}
              </div>
            </div>

            <div>
              <Label>Per-User Limit (optional)</Label>
              <Input type="number" value={form.perUserLimit} onChange={(e) => setField("perUserLimit", e.target.value)} className="max-w-[200px]" />
            </div>

            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={form.active} onChange={(e) => setField("active", e.target.checked)} className="h-4 w-4 rounded border-border" />
              Active
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="submit" loading={saving}>
                {isEdit ? "Save Changes" : "Create Coupon"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
