import { z } from 'zod';

export const CategorySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().optional(),
    parentId: z.number().int().positive().nullable().optional(),
    imageUrl: z.string().url().nullable().optional(),
    sortOrder: z.number().int().optional()
});

export const UpdateCategorySchema = CategorySchema.partial();

export type CategoryPayload = z.infer<typeof CategorySchema>;
export type UpdateCategoryPayload = z.infer<typeof UpdateCategorySchema>;
