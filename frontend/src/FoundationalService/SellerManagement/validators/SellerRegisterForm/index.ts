import { z } from "zod";

/** `phone` is required at the schema layer — live-verified against the running backend:
 * `POST /seller/auth/register` without `phone` 422s with `{errors:[{field:'phone',message:'Required'}]}`,
 * contradicting docs/PHASE3_ADDENDUM.md's `phone` listed as optional. Flagged as a contract
 * deviation in frontend/STATUS.md; form matches the real live behavior here. */
export const sellerRegisterFormSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().min(10, "Enter a valid phone number"),
  gstNumber: z.string().optional().or(z.literal(""))
});

export type SellerRegisterFormValues = z.infer<typeof sellerRegisterFormSchema>;
