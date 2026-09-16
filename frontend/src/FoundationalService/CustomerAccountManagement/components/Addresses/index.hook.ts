import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import type { Address } from "@/Common/types/entities";
import { customerService } from "../../service/customer.service";
import { addressFormSchema } from "../../validators/AddressForm";
import { getErrorMessage } from "@/Common/types/api";

const emptyForm = { label: "Home", line1: "", line2: "", city: "", state: "", pincode: "", phone: "", isDefault: false };

export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    customerService
      .listAddresses()
      .then((res) => setAddresses(res.data ?? []))
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (address: Address) => {
    setEditingId(address.id);
    setForm({ ...emptyForm, ...address, line2: address.line2 ?? "" });
    setErrors({});
    setModalOpen(true);
  };

  const setField = <K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = addressFormSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => (fieldErrors[String(issue.path[0])] = issue.message));
      setErrors(fieldErrors);
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await customerService.updateAddress(editingId, parsed.data);
        toast.success("Address updated");
      } else {
        await customerService.addAddress(parsed.data);
        toast.success("Address added");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't save this address."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this address?")) return;
    try {
      await customerService.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success("Address deleted");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't delete this address."));
    }
  };

  return { addresses, loading, modalOpen, setModalOpen, openCreate, openEdit, form, setField, errors, saving, handleSubmit, handleDelete, editingId };
}
