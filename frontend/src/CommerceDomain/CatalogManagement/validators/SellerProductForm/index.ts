import { z } from "zod";

/** Same field set as AdminProductForm's schema, minus `sellerId` — the addendum's "no
 * Seller-picker field on this form (implied by login)". */
export const sellerProductFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  sku: z.string().min(2, "SKU is required"),
  categoryId: z.string().min(1, "Select a category"),
  brandId: z.string().min(1, "Select a brand"),
  partNumber: z.string().optional(),
  oemNumber: z.string().optional(),
  basePrice: z.coerce.number().min(1, "Price must be greater than 0"),
  gstRate: z.coerce.number().min(0).max(28),
  stock: z.coerce.number().int("Whole numbers only").min(0, "Stock can't be negative"),
  // Packed weight drives the courier shipping cost, so it is required; box size is optional but
  // matters for bulky-light parts (couriers bill the larger of dead vs volumetric weight).
  weightGrams: z.coerce.number({ invalid_type_error: "Enter the packed weight in grams" }).int("Whole grams only").min(1, "Enter the packed weight in grams"),
  lengthCm: z.string().regex(/^\d*$/, "Whole cm only").optional(),
  widthCm: z.string().regex(/^\d*$/, "Whole cm only").optional(),
  heightCm: z.string().regex(/^\d*$/, "Whole cm only").optional(),
  status: z.enum(["draft", "active", "archived"]),
  description: z.string().optional(),
  images: z.array(z.string()).optional().default([])
});

export type SellerProductFormValues = z.infer<typeof sellerProductFormSchema>;
