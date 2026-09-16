import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Star, Check, X } from "lucide-react";
import type { Review } from "@/Common/types/entities";
import { masterService } from "../../service/master.service";
import { formatDate } from "@/Common/lib/utils";
import { Button } from "@/Common/components/ui/button";
import { Card, CardContent } from "@/Common/components/ui/card";
import { Spinner } from "@/Common/components/ui/spinner";
import { getErrorMessage } from "@/Common/types/api";

export default function ReviewModeration() {
  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    masterService
      .listPendingReviews()
      .then((res) => setItems(res.data.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const moderate = async (id: number, status: "approved" | "rejected") => {
    try {
      await masterService.moderateReview(id, status);
      setItems((prev) => prev.filter((r) => r.id !== id));
      toast.success(status === "approved" ? "Review approved" : "Review rejected");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't moderate this review."));
    }
  };

  return (
    <div>
      <h1 className="text-xl font-extrabold">Reviews Moderation</h1>
      <div className="mt-4">
        {loading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending reviews.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="flex items-center gap-1 text-sm font-semibold">
                      <Star className="h-4 w-4 fill-accent text-accent" /> {review.rating}/5 · {review.userName ?? "Customer"}
                    </p>
                    <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={() => moderate(review.id, "approved")}>
                      <Check className="h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => moderate(review.id, "rejected")}>
                      <X className="h-3.5 w-3.5" /> Reject
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
