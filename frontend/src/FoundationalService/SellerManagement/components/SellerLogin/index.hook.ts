import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { sellerAuthService } from "../../service/sellerAuth.service";
import { useAppDispatch } from "@/Common/hooks/useAppRedux";
import { sellerLoginSucceeded } from "@/redux/sellerAuthSlice";

/** Seller login. Unlike admin/customer login, a non-approved account is a normal (expected)
 * outcome, not an error to toast-and-forget — the backend's message is status-specific (pending
 * review / rejected + reason / suspended, per backend/STATUS.md Phase 3 §2) and must be shown
 * verbatim on the account-status screen rather than a generic "invalid credentials" toast. */
export function useSellerLogin() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const res = await sellerAuthService.login(email, password);
      dispatch(sellerLoginSucceeded(res.data));
      navigate("/seller/dashboard");
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Couldn't sign you in. Please check your credentials.";
      navigate("/seller/account-status", { state: { message } });
    } finally {
      setLoading(false);
    }
  };

  return { email, setEmail, password, setPassword, loading, handleSubmit };
}
