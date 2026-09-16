import { z } from 'zod';

export const CouponSchema = z.object({
    code: z.string().min(1, 'Code is required').toUpperCase(),
    type: z.enum(['percentage', 'flat']),
    value: z.number().int().positive(),
    minOrderValue: z.number().int().nonnegative().nullable().optional(),
    maxDiscount: z.number().int().positive().nullable().optional(),
    validFrom: z.coerce.date(),
    validTo: z.coerce.date(),
    usageLimit: z.number().int().positive().nullable().optional(),
    perUserLimit: z.number().int().positive().nullable().optional(),
    active: z.boolean().optional()
});

export const UpdateCouponSchema = CouponSchema.partial();

export type CouponPayload = z.infer<typeof CouponSchema>;
export type UpdateCouponPayload = z.infer<typeof UpdateCouponSchema>;
