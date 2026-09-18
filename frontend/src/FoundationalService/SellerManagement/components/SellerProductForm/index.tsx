import { useSellerProductForm } from "./index.hook";
import { Input } from "@/Common/components/ui/input";
import { Textarea } from "@/Common/components/ui/textarea";
import { Select } from "@/Common/components/ui/select";
import { Label } from "@/Common/components/ui/label";
import { Button } from "@/Common/components/ui/button";
import { Spinner } from "@/Common/components/ui/spinner";
import { Card, CardContent } from "@/Common/components/ui/card";
import { ImageUploader } from "@/Common/components/ImageUploader";

export default function SellerProductForm() {
  const { form, setField, errors, categories, brands, loading, saving, isEdit, handleSubmit } = useSellerProductForm();

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-extrabold">{isEdit ? "Edit Product" : "New Product"}</h1>

      <Card className="mt-4">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setField("title", e.target.value)} error={errors.title} />
              {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>SKU</Label>
                <Input value={form.sku} onChange={(e) => setField("sku", e.target.value)} error={errors.sku} />
                {errors.sku && <p className="mt-1 text-xs text-destructive">{errors.sku}</p>}
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onChange={(e) => setField("status", e.target.value as typeof form.status)}
                  options={[
                    { label: "Draft", value: "draft" },
                    { label: "Active", value: "active" },
                    { label: "Archived", value: "archived" }
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select
                  placeholder="Select category"
                  value={form.categoryId}
                  onChange={(e) => setField("categoryId", e.target.value)}
                  options={categories.map((c) => ({ label: c.name, value: String(c.id) }))}
                />
                {errors.categoryId && <p className="mt-1 text-xs text-destructive">{errors.categoryId}</p>}
              </div>
              <div>
                <Label>Brand</Label>
                <Select
                  placeholder="Select brand"
                  value={form.brandId}
                  onChange={(e) => setField("brandId", e.target.value)}
                  options={brands.map((b) => ({ label: b.name, value: String(b.id) }))}
                />
                {errors.brandId && <p className="mt-1 text-xs text-destructive">{errors.brandId}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Part Number</Label>
                <Input value={form.partNumber} onChange={(e) => setField("partNumber", e.target.value)} />
              </div>
              <div>
                <Label>OEM Number</Label>
                <Input value={form.oemNumber} onChange={(e) => setField("oemNumber", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Base Price (paise)</Label>
                <Input type="number" value={form.basePrice} onChange={(e) => setField("basePrice", e.target.value)} error={errors.basePrice} />
                {errors.basePrice && <p className="mt-1 text-xs text-destructive">{errors.basePrice}</p>}
              </div>
              <div>
                <Label>GST Rate (%)</Label>
                <Input type="number" value={form.gstRate} onChange={(e) => setField("gstRate", e.target.value)} />
              </div>
            </div>

            <div>
              <Label>Stock (units available)</Label>
              <Input type="number" min={0} value={form.stock} onChange={(e) => setField("stock", e.target.value)} error={errors.stock} />
              {errors.stock && <p className="mt-1 text-xs text-destructive">{errors.stock}</p>}
              <p className="mt-1 text-xs text-muted-foreground">
                A product with 0 stock shows as "Out of stock" to buyers even if it's otherwise active.
              </p>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={5} />
            </div>

            <div>
              <Label>Product Images</Label>
              <ImageUploader images={form.images} onChange={(images) => setField("images", images)} maxImages={8} showPrimary />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="submit" loading={saving}>
                {isEdit ? "Save Changes" : "Create Product"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
