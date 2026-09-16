import { z } from "zod";

export const couponFormSchema = z
  .object({
    code: z.string().min(1, "Code is required").transform((v) => v.toUpperCase()),
    type: z.enum(["percentage", "flat"]),
    value: z.coerce.number().int().positive("Value must be a positive number"),
    minOrderValue: z.union([z.coerce.number().int().nonnegative(), z.literal("")]).optional(),
    maxDiscount: z.union([z.coerce.number().int().positive(), z.literal("")]).optional(),
    validFrom: z.string().min(1, "Start date is required"),
    validTo: z.string().min(1, "End date is required"),
    usageLimit: z.union([z.coerce.number().int().positive(), z.literal("")]).optional(),
    perUserLimit: z.union([z.coerce.number().int().positive(), z.literal("")]).optional(),
    active: z.boolean().optional()
  })
  .refine((data) => new Date(data.validTo) >= new Date(data.validFrom), {
    message: "End date must be on or after the start date",
    path: ["validTo"]
  });

export type CouponFormValues = z.infer<typeof couponFormSchema>;
