import { z } from "zod";

export const adminProductFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  sku: z.string().min(2, "SKU is required"),
  categoryId: z.string().min(1, "Select a category"),
  brandId: z.string().min(1, "Select a brand"),
  partNumber: z.string().optional(),
  oemNumber: z.string().optional(),
  basePrice: z.coerce.number().min(1, "Price must be greater than 0"),
  gstRate: z.coerce.number().min(0).max(28),
  status: z.enum(["draft", "active", "archived"]),
  description: z.string().optional()
});

export type AdminProductFormValues = z.infer<typeof adminProductFormSchema>;
