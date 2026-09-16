import { useProfile } from "./index.hook";
import { Input } from "@/Common/components/ui/input";
import { Label } from "@/Common/components/ui/label";
import { Button } from "@/Common/components/ui/button";
import { Card, CardContent } from "@/Common/components/ui/card";

export default function Profile() {
  const { form, setField, saving, handleSubmit } = useProfile();

  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="text-lg font-bold">Profile Details</h2>
        <form onSubmit={handleSubmit} className="mt-4 max-w-md space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input value={form.name} onChange={(e) => setField("name", e.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
          </div>
          <Button type="submit" loading={saving}>
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
