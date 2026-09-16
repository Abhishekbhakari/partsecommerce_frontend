import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { customerService } from "../../service/customer.service";
import { useAppDispatch, useAppSelector } from "@/Common/hooks/useAppRedux";
import { profileUpdated } from "@/redux/authSlice";
import { getErrorMessage } from "@/Common/types/api";

export function useProfile() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [form, setForm] = useState({ name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "" });
  const [saving, setSaving] = useState(false);

  const setField = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await customerService.updateProfile(form);
      dispatch(profileUpdated(res.data));
      toast.success("Profile updated");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't update your profile."));
    } finally {
      setSaving(false);
    }
  };

  return { user, form, setField, saving, handleSubmit };
}
