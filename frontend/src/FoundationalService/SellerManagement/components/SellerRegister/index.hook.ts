import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { sellerAuthService } from "../../service/sellerAuth.service";
import { sellerRegisterFormSchema } from "../../validators/SellerRegisterForm";
import { getErrorMessage } from "@/Common/types/api";

const emptyForm = { businessName: "", email: "", password: "", phone: "", gstNumber: "" };

export function useSellerRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const setField = <K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = sellerRegisterFormSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        fieldErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const payload = {
        businessName: parsed.data.businessName,
        email: parsed.data.email,
        password: parsed.data.password,
        ...(parsed.data.phone ? { phone: parsed.data.phone } : {}),
        ...(parsed.data.gstNumber ? { gstNumber: parsed.data.gstNumber } : {})
      };
      await sellerAuthService.register(payload);
      setSubmitted(true);
      toast.success("Application submitted for review.");
      setTimeout(() => navigate("/seller/login"), 2500);
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't submit your application. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return { form, setField, errors, submitting, submitted, handleSubmit };
}
