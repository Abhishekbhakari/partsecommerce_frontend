import { useEffect, useState } from "react";
import { Image } from "lucide-react";
import type { Banner } from "@/Common/types/entities";
import { masterService } from "../../service/master.service";
import { Badge } from "@/Common/components/ui/badge";
import { Card, CardContent } from "@/Common/components/ui/card";
import { Spinner } from "@/Common/components/ui/spinner";

/** List-only for now (P1 in docs/BACKLOG.md) — create/edit + image upload to follow. */
export default function BannerManagement() {
  const [items, setItems] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    masterService
      .listBanners()
      .then((res) => setItems(res.data ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="flex items-center gap-2 text-xl font-extrabold">
        <Image className="h-5 w-5" /> Banners
      </h1>
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
                  <Badge variant={b.active ? "success" : "secondary"}>{b.active ? "Active" : "Inactive"}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
