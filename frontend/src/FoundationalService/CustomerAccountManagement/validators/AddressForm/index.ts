import { z } from "zod";

export const addressFormSchema = z.object({
  label: z.string().min(1, "Label is required"),
  line1: z.string().min(3, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  phone: z.string().min(10, "Enter a valid phone number"),
  isDefault: z.boolean().optional()
});

export type AddressFormValues = z.infer<typeof addressFormSchema>;
