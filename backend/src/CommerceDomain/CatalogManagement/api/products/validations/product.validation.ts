import { z } from 'zod';

export const ProductVariantInputSchema = z.object({
    id: z.number().int().positive().optional(),
    name: z.string().min(1),
    skuSuffix: z.string().nullable().optional(),
    priceDelta: z.number().int().optional(),
    stock: z.number().int().nonnegative().optional(),
    weightGrams: z.number().int().positive().nullable().optional(),
    barcode: z.string().nullable().optional()
});

export const FitmentInputSchema = z.object({
    id: z.number().int().positive().optional(),
    make: z.string().min(1),
    model: z.string().min(1),
    yearFrom: z.number().int(),
    yearTo: z.number().int(),
    variant: z.string().nullable().optional()
});

export const ProductSchema = z.object({
    sku: z.string().min(1, 'SKU is required'),
    title: z.string().min(1, 'Title is required'),
    slug: z.string().optional(),
    description: z.string().nullable().optional(),
    categoryId: z.number().int().positive(),
    brandId: z.number().int().positive(),
    sellerId: z.number().int().positive('sellerId is required'),
    partNumber: z.string().nullable().optional(),
    oemNumber: z.string().nullable().optional(),
    basePrice: z.number().int().positive('basePrice must be in paise (integer > 0)'),
    gstRate: z.number().min(0).max(100).optional(),
    images: z.array(z.string().url()).optional(),
    status: z.enum(['draft', 'active', 'archived']).optional(),
    variants: z.array(ProductVariantInputSchema).optional(),
    fitment: z.array(FitmentInputSchema).optional()
});

export const UpdateProductSchema = ProductSchema.partial();

/** Used by the seller product controller — sellerId is never accepted from the request body,
 *  it is always derived server-side from the authenticated seller (see product.service.ts). */
export const SellerProductSchema = ProductSchema.omit({ sellerId: true });
export const UpdateSellerProductSchema = SellerProductSchema.partial();

export const ProductListQuerySchema = z.object({
    category: z.string().optional(),
    brand: z.string().optional(),
    priceMin: z.coerce.number().optional(),
    priceMax: z.coerce.number().optional(),
    sort: z.enum(['price_asc', 'price_desc', 'newest', 'rating', 'popular']).optional(),
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().optional(),
    q: z.string().optional()
});

export const UpdateInventorySchema = z.object({
    variantId: z.number().int().positive(),
    stock: z.number().int().nonnegative()
});

export type ProductPayload = z.infer<typeof ProductSchema>;
export type UpdateProductPayload = z.infer<typeof UpdateProductSchema>;
export type SellerProductPayload = z.infer<typeof SellerProductSchema>;
export type UpdateSellerProductPayload = z.infer<typeof UpdateSellerProductSchema>;
export type ProductListQuery = z.infer<typeof ProductListQuerySchema>;
export type UpdateInventoryPayload = z.infer<typeof UpdateInventorySchema>;
