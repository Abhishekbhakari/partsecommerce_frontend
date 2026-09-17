import { Link } from "react-router-dom";
import { Store, CheckCircle2 } from "lucide-react";
import { useSellerRegister } from "./index.hook";
import { Input } from "@/Common/components/ui/input";
import { Label } from "@/Common/components/ui/label";
import { Button } from "@/Common/components/ui/button";
import { Card, CardContent } from "@/Common/components/ui/card";

export default function SellerRegister() {
  const { form, setField, errors, submitting, submitted, handleSubmit } = useSellerRegister();

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4 py-10">
      <div className="w-full max-w-md rounded-xl bg-card p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center text-center">
          <Store className="h-8 w-8 text-primary" />
          <h1 className="mt-2 text-xl font-extrabold">Become a Seller</h1>
          <p className="text-sm text-muted-foreground">Register your business to start listing products</p>
        </div>

        {submitted ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
              <CheckCircle2 className="h-10 w-10 text-success" />
              <p className="font-semibold">Application submitted</p>
              <p className="text-sm text-muted-foreground">
                We'll review your application and email you once a decision is made. Redirecting to sign in…
              </p>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label>Business Name</Label>
              <Input value={form.businessName} onChange={(e) => setField("businessName", e.target.value)} error={errors.businessName} />
              {errors.businessName && <p className="mt-1 text-xs text-destructive">{errors.businessName}</p>}
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} error={errors.email} />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={form.password} onChange={(e) => setField("password", e.target.value)} error={errors.password} />
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setField("phone", e.target.value)} error={errors.phone} />
              {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
            </div>
            <div>
              <Label>GST Number (optional)</Label>
              <Input value={form.gstNumber} onChange={(e) => setField("gstNumber", e.target.value)} />
            </div>
            <Button type="submit" className="w-full" loading={submitting}>
              Submit Application
            </Button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already registered?{" "}
          <Link to="/seller/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
