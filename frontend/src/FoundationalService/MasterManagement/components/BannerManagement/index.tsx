import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Image, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Banner } from "@/Common/types/entities";
import { masterService } from "../../service/master.service";
import { Badge } from "@/Common/components/ui/badge";
import { Button } from "@/Common/components/ui/button";
import { Card, CardContent } from "@/Common/components/ui/card";
import { Spinner } from "@/Common/components/ui/spinner";

export default function BannerManagement() {
  const [items, setItems] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    masterService
      .listBanners()
      .then((res) => setItems(res.data ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this banner? This can't be undone.")) return;
    try {
      await masterService.deleteBanner(id);
      toast.success("Banner deleted");
      load();
    } catch {
      toast.error("Couldn't delete this banner.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-xl font-extrabold">
          <Image className="h-5 w-5" /> Banners
        </h1>
        <Link to="/admin/banners/new">
          <Button>
            <Plus className="h-4 w-4" /> New Banner
          </Button>
        </Link>
      </div>
      <div className="mt-4">
        {loading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No banners yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((b) => (
              <Card key={b.id}>
                <div className="aspect-[3/1] w-full overflow-hidden rounded-t-lg bg-secondary">
                  {b.imageUrl && <img src={b.imageUrl} alt={b.title} className="h-full w-full object-cover" />}
                </div>
                <CardContent className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-sm font-semibold">{b.title}</p>
                    <p className="text-xs text-muted-foreground">{b.placement}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant={b.active ? "success" : "secondary"}>{b.active ? "Active" : "Inactive"}</Badge>
                    <Link to={`/admin/banners/${b.id}/edit`}>
                      <Button variant="ghost" size="icon" aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => handleDelete(b.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
