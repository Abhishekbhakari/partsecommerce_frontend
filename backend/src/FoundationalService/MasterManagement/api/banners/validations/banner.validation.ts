import { z } from 'zod';

/** Accepts an absolute URL (external link) or a relative in-app path like "/products". */
const linkSchema = z
    .string()
    .refine(
        (value) => value.startsWith('/') || /^https?:\/\/.+/.test(value),
        'Link must be an absolute URL or a relative path starting with "/".'
    );

export const BannerSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    imageUrl: z.string().url('Valid image URL is required'),
    link: linkSchema.nullable().optional(),
    placement: z.string().optional(),
    active: z.boolean().optional()
});

export const UpdateBannerSchema = BannerSchema.partial();

export type BannerPayload = z.infer<typeof BannerSchema>;
export type UpdateBannerPayload = z.infer<typeof UpdateBannerSchema>;
