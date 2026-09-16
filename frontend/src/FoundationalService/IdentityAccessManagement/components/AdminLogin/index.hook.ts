import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { adminAuthService } from "../../service/adminAuth.service";
import { useAppDispatch } from "@/Common/hooks/useAppRedux";
import { adminLoginSucceeded } from "@/redux/authSlice";
import { getErrorMessage } from "@/Common/types/api";

export function useAdminLogin() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Enter your email and password");
      return;
    }
    setLoading(true);
    try {
      const res = await adminAuthService.login(email, password);
      dispatch(adminLoginSucceeded(res.data));
      toast.success(`Welcome back, ${res.data.user.name}`);
      navigate("/admin");
    } catch (err) {
      toast.error(getErrorMessage(err, "Invalid staff credentials."));
    } finally {
      setLoading(false);
    }
  };

  return { email, setEmail, password, setPassword, loading, handleSubmit };
}
