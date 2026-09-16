import { z } from 'zod';

export const BrandSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().optional(),
    logoUrl: z.string().url().nullable().optional()
});

export const UpdateBrandSchema = BrandSchema.partial();

export type BrandPayload = z.infer<typeof BrandSchema>;
export type UpdateBrandPayload = z.infer<typeof UpdateBrandSchema>;
