import { z } from 'zod';

export const CancelOrderSchema = z.object({
    reason: z.string().min(1, 'Cancellation reason is required')
});

export const ReturnOrderSchema = z.object({
    items: z.array(z.object({ orderItemId: z.number().int().positive(), qty: z.number().int().positive() })).min(1),
    reason: z.string().min(1, 'Return reason is required')
});

export const UpdateOrderStatusSchema = z.object({
    status: z.enum(['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'])
});

export type CancelOrderPayload = z.infer<typeof CancelOrderSchema>;
export type ReturnOrderPayload = z.infer<typeof ReturnOrderSchema>;
export type UpdateOrderStatusPayload = z.infer<typeof UpdateOrderStatusSchema>;
