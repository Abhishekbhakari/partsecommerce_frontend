import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { staffService } from "../../service/staff.service";
import type { AdminUser, AdminRole } from "@/Common/types/entities";
import { getErrorMessage } from "@/Common/types/api";

const emptyInvite = { name: "", email: "", role: "support" as AdminRole };

/** Staff & roles admin page — invite (email/name/role), change role, remove, wired to
 * `/admin/staff` (owner-only), per docs/PHASE2_ADDENDUM.md §5. */
export function useStaffManagement() {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [invite, setInvite] = useState(emptyInvite);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    staffService
      .list()
      .then((res) => setItems(res.data ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const setField = <K extends keyof typeof emptyInvite>(key: K, value: (typeof emptyInvite)[K]) =>
    setInvite((f) => ({ ...f, [key]: value }));

  const openInvite = () => {
    setInvite(emptyInvite);
    setErrors({});
    setModalOpen(true);
  };

  const submitInvite = async (e: FormEvent) => {
    e.preventDefault();
    const fieldErrors: Record<string, string> = {};
    if (!invite.name.trim()) fieldErrors.name = "Name is required";
    if (!/^\S+@\S+\.\S+$/.test(invite.email)) fieldErrors.email = "Enter a valid email";
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }
    setSaving(true);
    try {
      await staffService.invite(invite);
      toast.success(`${invite.name} invited — temp password was logged server-side (stub email delivery).`);
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't invite this staff member."));
    } finally {
      setSaving(false);
    }
  };

  const changeRole = async (id: number, role: AdminRole) => {
    try {
      await staffService.changeRole(id, role);
      toast.success("Role updated");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't change this staff member's role."));
    }
  };

  const remove = async (id: number, name: string) => {
    if (!window.confirm(`Remove ${name} from staff?`)) return;
    try {
      await staffService.remove(id);
      toast.success("Staff member removed");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't remove this staff member."));
    }
  };

  return { items, loading, modalOpen, setModalOpen, invite, setField, errors, saving, openInvite, submitInvite, changeRole, remove };
}
