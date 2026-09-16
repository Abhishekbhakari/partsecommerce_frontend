import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useBannerForm } from "./index.hook";
import { Input } from "@/Common/components/ui/input";
import { Select } from "@/Common/components/ui/select";
import { Label } from "@/Common/components/ui/label";
import { Button } from "@/Common/components/ui/button";
import { Spinner } from "@/Common/components/ui/spinner";
import { Card, CardContent } from "@/Common/components/ui/card";
import { ImageUploader } from "@/Common/components/ImageUploader";

export default function BannerForm() {
  const { form, setField, errors, loading, saving, isEdit, handleSubmit, PLACEMENTS } = useBannerForm();

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto max-w-xl">
      <Link to="/admin/banners" className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Banners
      </Link>
      <h1 className="text-xl font-extrabold">{isEdit ? "Edit Banner" : "New Banner"}</h1>

      <Card className="mt-4">
        <CardContent className="space-y-4 pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setField("title", e.target.value)} error={errors.title} />
              {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title}</p>}
            </div>

            <div>
              <Label>Banner Image</Label>
              <ImageUploader
                images={form.imageUrl ? [form.imageUrl] : []}
                onChange={(images) => setField("imageUrl", images[0] ?? "")}
                maxImages={1}
              />
              {errors.imageUrl && <p className="mt-1 text-xs text-destructive">{errors.imageUrl}</p>}
            </div>

            <div>
              <Label>Link (optional)</Label>
              <Input value={form.link} onChange={(e) => setField("link", e.target.value)} placeholder="https://…" error={errors.link} />
              {errors.link && <p className="mt-1 text-xs text-destructive">{errors.link}</p>}
            </div>

            <div>
              <Label>Placement</Label>
              <Select
                value={form.placement}
                onChange={(e) => setField("placement", e.target.value)}
                options={PLACEMENTS.map((p) => ({ label: p, value: p }))}
              />
            </div>

            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={form.active} onChange={(e) => setField("active", e.target.checked)} className="h-4 w-4 rounded border-border" />
              Active
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="submit" loading={saving}>
                {isEdit ? "Save Changes" : "Create Banner"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
