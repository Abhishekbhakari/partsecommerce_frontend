import { UserCog, Plus, Trash2 } from "lucide-react";
import { useStaffManagement } from "./index.hook";
import type { AdminUser, AdminRole } from "@/Common/types/entities";
import { Button } from "@/Common/components/ui/button";
import { Input } from "@/Common/components/ui/input";
import { Label } from "@/Common/components/ui/label";
import { Select } from "@/Common/components/ui/select";
import { Modal } from "@/Common/components/ui/modal";
import { Badge } from "@/Common/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/Common/components/ui/data-table";

const ROLE_OPTIONS: { label: string; value: AdminRole }[] = [
  { label: "Owner", value: "owner" },
  { label: "Manager", value: "manager" },
  { label: "Catalog Editor", value: "catalog_editor" },
  { label: "Order Manager", value: "order_manager" },
  { label: "Support", value: "support" }
];

/** Owner-only screen (`requireOwner` on the backend) — if a non-owner admin loads this page,
 * `/admin/staff` calls will 403 and the table just renders empty via the catch in the hook. */
export default function StaffManagement() {
  const { items, loading, modalOpen, setModalOpen, invite, setField, errors, saving, openInvite, submitInvite, changeRole, remove } =
    useStaffManagement();

  const columns: DataTableColumn<AdminUser>[] = [
    { key: "name", header: "Name", render: (s) => <span className="font-semibold">{s.name}</span> },
    { key: "email", header: "Email" },
    {
      key: "role",
      header: "Role",
      render: (s) => (
        <Select
          value={s.role}
          onChange={(e) => changeRole(s.id, e.target.value as AdminRole)}
          options={ROLE_OPTIONS}
          className="h-9 max-w-[180px]"
        />
      )
    },
    { key: "status", header: "", render: (s) => (s.role === "owner" ? <Badge variant="secondary">Owner</Badge> : null) },
    {
      key: "actions",
      header: "",
      render: (s) => (
        <Button variant="ghost" size="icon" aria-label="Remove" onClick={() => remove(s.id, s.name)} disabled={s.role === "owner"}>
          <Trash2 className="h-4 w-4" />
        </Button>
      )
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-xl font-extrabold">
          <UserCog className="h-5 w-5" /> Staff &amp; Roles
        </h1>
        <Button onClick={openInvite}>
          <Plus className="h-4 w-4" /> Invite Staff
        </Button>
      </div>

      <div className="mt-4">
        <DataTable columns={columns} rows={items} rowKey={(s) => s.id} loading={loading} emptyMessage="No staff members yet." />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Invite Staff Member">
        <form onSubmit={submitInvite} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={invite.name} onChange={(e) => setField("name", e.target.value)} error={errors.name} />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={invite.email} onChange={(e) => setField("email", e.target.value)} error={errors.email} />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
          </div>
          <div>
            <Label>Role</Label>
            <Select value={invite.role} onChange={(e) => setField("role", e.target.value as AdminRole)} options={ROLE_OPTIONS} />
          </div>
          <p className="text-xs text-muted-foreground">
            A temporary password is generated and logged server-side (email delivery is stubbed in this environment).
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="submit" loading={saving}>
              Send Invite
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
