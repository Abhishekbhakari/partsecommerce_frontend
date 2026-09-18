import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { customerAuthService } from "../../service/auth.service";
import { emailLoginSchema, emailRegisterSchema, otpRequestSchema, otpVerifySchema } from "../../validators/Login";
import { useAppDispatch } from "@/Common/hooks/useAppRedux";
import { customerLoginSucceeded } from "@/redux/authSlice";
import { getErrorMessage } from "@/Common/types/api";

export type LoginMode = "otp" | "email";

export function useLogin() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? "/account/profile";

  const [mode, setMode] = useState<LoginMode>("otp");
  const [loading, setLoading] = useState(false);

  // OTP flow
  const [identifier, setIdentifier] = useState("");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [otp, setOtp] = useState("");

  // Email flow
  const [emailStep, setEmailStep] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const finishLogin = (data: { accessToken: string; refreshToken: string; user: any }) => {
    dispatch(customerLoginSucceeded(data));
    toast.success(`Welcome${data.user?.name ? `, ${data.user.name}` : ""}!`);
    navigate(redirectTo, { replace: true });
  };

  const handleRequestOtp = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = otpRequestSchema.safeParse({ identifier });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const res = await customerAuthService.requestOtp(identifier);
      setRequestId(res.data.requestId);
      toast.success("OTP sent");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't send OTP right now."));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = otpVerifySchema.safeParse({ otp });
    if (!parsed.success || !requestId) {
      toast.error(parsed.success ? "Request an OTP first" : parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const res = await customerAuthService.verifyOtp(requestId, otp);
      finishLogin(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Invalid or expired OTP."));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = emailLoginSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const res = await customerAuthService.emailLogin(email, password);
      finishLogin(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Invalid email or password."));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailRegister = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = emailRegisterSchema.safeParse({ name, email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const res = await customerAuthService.emailRegister(name, email, password);
      finishLogin(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't create your account — that email may already be registered."));
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
}
