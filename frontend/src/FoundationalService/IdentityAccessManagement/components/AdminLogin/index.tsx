import { Wrench } from "lucide-react";
import { useAdminLogin } from "./index.hook";
import { Input } from "@/Common/components/ui/input";
import { Label } from "@/Common/components/ui/label";
import { Button } from "@/Common/components/ui/button";

export default function AdminLogin() {
  const { email, setEmail, password, setPassword, loading, handleSubmit } = useAdminLogin();

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4">
      <div className="w-full max-w-sm rounded-xl bg-card p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center text-center">
          <Wrench className="h-8 w-8 text-primary" />
          <h1 className="mt-2 text-xl font-extrabold">PartsHub Admin</h1>
          <p className="text-sm text-muted-foreground">Staff sign-in</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
          <Button type="submit" className="w-full" loading={loading}>
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
