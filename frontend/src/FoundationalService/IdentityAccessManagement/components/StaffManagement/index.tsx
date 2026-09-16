import { UserCog } from "lucide-react";

/** Stub — P1 in docs/BACKLOG.md. Wire up to GET/POST /admin/staff, PATCH /admin/staff/:id/role,
 * DELETE /admin/staff/:id (see docs/API_CONTRACT.md "Admin — Coupons, Banners/CMS, Reports, Staff")
 * once prioritized. */
export default function StaffManagement() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
      <UserCog className="h-10 w-10 text-muted-foreground" />
      <h1 className="mt-3 text-lg font-bold">Staff &amp; Roles</h1>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Staff invitations and role management are coming soon.
      </p>
    </div>
  );
}
