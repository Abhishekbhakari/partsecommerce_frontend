import { Wrench, Smartphone, Mail } from "lucide-react";
import { useLogin } from "./index.hook";
import { cn } from "@/Common/lib/utils";
import { Input } from "@/Common/components/ui/input";
import { Button } from "@/Common/components/ui/button";

export default function Login() {
  const {
    mode,
    setMode,
    loading,
    identifier,
    setIdentifier,
    requestId,
    otp,
    setOtp,
    emailStep,
    setEmailStep,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    handleRequestOtp,
    handleVerifyOtp,
    handleEmailLogin,
    handleEmailRegister
  } = useLogin();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-secondary/40 px-4 py-10">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-card sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <Wrench className="h-8 w-8 text-primary" />
          <h1 className="mt-2 text-xl font-extrabold">Sign in to PartsHub</h1>
          <p className="text-sm text-muted-foreground">Track orders, manage addresses, and check out faster.</p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-1 rounded-md bg-secondary p-1 text-sm font-semibold">
          <button
            className={cn("rounded-md py-2 transition-colors", mode === "otp" ? "bg-card shadow-sm text-primary" : "text-muted-foreground")}
            onClick={() => setMode("otp")}
          >
            <Smartphone className="mr-1 inline h-4 w-4" /> OTP
          </button>
          <button
            className={cn("rounded-md py-2 transition-colors", mode === "email" ? "bg-card shadow-sm text-primary" : "text-muted-foreground")}
            onClick={() => setMode("email")}
          >
            <Mail className="mr-1 inline h-4 w-4" /> Email
          </button>
        </div>

        {mode === "otp" ? (
          !requestId ? (
            <form onSubmit={handleRequestOtp} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Phone or Email</label>
                <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="you@example.com or 9876543210" />
              </div>
              <Button type="submit" className="w-full" loading={loading}>
                Send OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-3">
              <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to {identifier}</p>
              <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" maxLength={6} />
              <Button type="submit" className="w-full" loading={loading}>
                Verify &amp; Sign In
              </Button>
            </form>
          )
        ) : emailStep === "login" ? (
          <form onSubmit={handleEmailLogin} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </div>
            <Button type="submit" className="w-full" loading={loading}>
              Sign In
            </Button>
            <button
              type="button"
              onClick={() => setEmailStep("register")}
              className="w-full text-center text-sm font-semibold text-primary hover:underline"
            >
              New here? Create an account
            </button>
          </form>
        ) : (
          <form onSubmit={handleEmailRegister} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full" loading={loading}>
              Create Account
            </Button>
            <button
              type="button"
              onClick={() => setEmailStep("login")}
              className="w-full text-center text-sm font-semibold text-primary hover:underline"
            >
              Already have an account? Sign in
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
