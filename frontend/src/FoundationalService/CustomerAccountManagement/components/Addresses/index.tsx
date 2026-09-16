import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { useAddresses } from "./index.hook";
import { Button } from "@/Common/components/ui/button";
import { Input } from "@/Common/components/ui/input";
import { Label } from "@/Common/components/ui/label";
import { Card, CardContent } from "@/Common/components/ui/card";
import { Badge } from "@/Common/components/ui/badge";
import { Modal } from "@/Common/components/ui/modal";
import { Spinner } from "@/Common/components/ui/spinner";

export default function Addresses() {
  const { addresses, loading, modalOpen, setModalOpen, openCreate, openEdit, form, setField, errors, saving, handleSubmit, handleDelete, editingId } =
    useAddresses();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Saved Addresses</h2>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Address
        </Button>
      </div>

      {loading ? (
        <Spinner />
      ) : addresses.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No saved addresses yet.</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {addresses.map((addr) => (
            <Card key={addr.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <p className="flex items-center gap-1.5 font-semibold">
                    <MapPin className="h-4 w-4 text-primary" /> {addr.label}
                  </p>
                  {addr.isDefault && <Badge variant="secondary">Default</Badge>}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {addr.line1}
                  {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} {addr.pincode}
                </p>
                <p className="text-sm text-muted-foreground">Phone: {addr.phone}</p>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(addr)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(addr.id)}>
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Address" : "Add Address"}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Label</Label>
            <Input value={form.label} onChange={(e) => setField("label", e.target.value)} error={errors.label} />
          </div>
          <div>
            <Label>Address Line 1</Label>
            <Input value={form.line1} onChange={(e) => setField("line1", e.target.value)} error={errors.line1} />
          </div>
          <div>
            <Label>Address Line 2 (optional)</Label>
            <Input value={form.line2} onChange={(e) => setField("line2", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => setField("city", e.target.value)} error={errors.city} />
            </div>
            <div>
              <Label>State</Label>
              <Input value={form.state} onChange={(e) => setField("state", e.target.value)} error={errors.state} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Pincode</Label>
              <Input value={form.pincode} onChange={(e) => setField("pincode", e.target.value)} error={errors.pincode} maxLength={6} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setField("phone", e.target.value)} error={errors.phone} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setField("isDefault", e.target.checked)} />
            Set as default address
          </label>
          <Button type="submit" className="w-full" loading={saving}>
            Save Address
          </Button>
        </form>
      </Modal>
    </div>
  );
}
