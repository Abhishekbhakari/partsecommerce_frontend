import { z } from 'zod';

export const AddCartItemSchema = z.object({
    variantId: z.number().int().positive(),
    qty: z.number().int().positive()
});

export const UpdateCartItemSchema = z.object({
    qty: z.number().int().positive()
});

export const ApplyCouponSchema = z.object({
    code: z.string().min(1, 'Coupon code is required')
});

export type AddCartItemPayload = z.infer<typeof AddCartItemSchema>;
export type UpdateCartItemPayload = z.infer<typeof UpdateCartItemSchema>;
export type ApplyCouponPayload = z.infer<typeof ApplyCouponSchema>;
