import { useSellerAuth } from "@/Common/hooks/useSellerAuth";
import { Card, CardContent } from "@/Common/components/ui/card";
import { Badge } from "@/Common/components/ui/badge";
import { Label } from "@/Common/components/ui/label";

const STATUS_VARIANT = { pending: "secondary", approved: "success", rejected: "destructive", suspended: "outline" } as const;

/** Read-only profile summary — editable settings (bank details, password change) are a natural
 * follow-up once this base portal is live; not in the Phase 3 addendum's explicit scope. */
export default function SellerProfile() {
  const { seller } = useSellerAuth();

  if (!seller) return null;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-xl font-extrabold">Profile</h1>
      <Card className="mt-4">
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Business Name</Label>
              <p className="font-semibold">{seller.businessName}</p>
            </div>
            <Badge variant={STATUS_VARIANT[seller.status]} className="capitalize">
              {seller.status}
            </Badge>
          </div>
          <div>
            <Label>Email</Label>
            <p>{seller.email}</p>
          </div>
          <div>
            <Label>Phone</Label>
            <p>{seller.phone || "—"}</p>
          </div>
          <div>
            <Label>GST Number</Label>
            <p>{seller.gstNumber || "—"}</p>
          </div>
          <div>
            <Label>Commission Rate Override</Label>
            <p>{seller.commissionRateOverride != null ? `${seller.commissionRateOverride}%` : "Platform default"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
