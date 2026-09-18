import { z } from "zod";

export const adminProductFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  sku: z.string().min(2, "SKU is required"),
  categoryId: z.string().min(1, "Select a category"),
  brandId: z.string().min(1, "Select a brand"),
  // Required per docs/PHASE3_ADDENDUM.md — admin must assign every product to an owning seller
  // (backend/STATUS.md: `POST /admin/products` now requires `sellerId` (number), 422s without it).
  sellerId: z.string().min(1, "Select a seller"),
  partNumber: z.string().optional(),
  oemNumber: z.string().optional(),
  basePrice: z.coerce.number().min(1, "Price must be greater than 0"),
  gstRate: z.coerce.number().min(0).max(28),
  stock: z.coerce.number().int("Whole numbers only").min(0, "Stock can't be negative"),
  status: z.enum(["draft", "active", "archived"]),
  description: z.string().optional(),
  images: z.array(z.string()).optional().default([])
});

export type AdminProductFormValues = z.infer<typeof adminProductFormSchema>;
