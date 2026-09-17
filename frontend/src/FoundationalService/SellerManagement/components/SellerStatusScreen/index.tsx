import { useLocation, Link, Navigate } from "react-router-dom";
import { Clock, XCircle, Ban } from "lucide-react";
import { Badge } from "@/Common/components/ui/badge";
import { Button } from "@/Common/components/ui/button";

/**
 * Single status-driven template (per design/SELLER_PORTAL_NOTES.md #3) shown when a login attempt
 * fails because the seller account isn't approved. The backend's exact message
 * (`err.response.data.message`) is displayed verbatim — this component only picks the
 * icon/badge/title by matching keywords in that message, it never invents its own copy for the
 * reason text itself.
 */
export default function SellerStatusScreen() {
  const location = useLocation();
  const message = (location.state as { message?: string } | null)?.message;

  if (!message) return <Navigate to="/seller/login" replace />;

  const lower = message.toLowerCase();
  const isRejected = lower.includes("reject");
  const isSuspended = lower.includes("suspend");

  const config = isRejected
    ? { icon: XCircle, badge: "destructive" as const, label: "Application Rejected", title: "Your seller application wasn't approved" }
    : isSuspended
      ? { icon: Ban, badge: "secondary" as const, label: "Account Suspended", title: "Your seller account has been suspended" }
      : { icon: Clock, badge: "accent" as const, label: "Pending Review", title: "Your application is under review" };

  const Icon = config.icon;

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-lg">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
          <Icon className="h-7 w-7 text-muted-foreground" />
        </div>
        <Badge variant={config.badge} className="mx-auto mt-4">
          {config.label}
        </Badge>
        <h1 className="mt-3 text-xl font-extrabold">{config.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>

        <div className="mt-6 flex flex-col gap-2">
          {isRejected && (
            <Link to="/seller/register">
              <Button className="w-full">Re-apply</Button>
            </Link>
          )}
          <Link to="/seller/login">
            <Button variant="outline" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
