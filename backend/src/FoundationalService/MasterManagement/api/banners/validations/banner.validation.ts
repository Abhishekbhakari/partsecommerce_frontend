import { z } from 'zod';

export const BannerSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    imageUrl: z.string().url('Valid image URL is required'),
    link: z.string().url().nullable().optional(),
    placement: z.string().optional(),
    active: z.boolean().optional()
});

export const UpdateBannerSchema = BannerSchema.partial();

export type BannerPayload = z.infer<typeof BannerSchema>;
export type UpdateBannerPayload = z.infer<typeof UpdateBannerSchema>;
