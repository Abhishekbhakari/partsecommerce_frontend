import { z } from 'zod';

export const CreateIntentSchema = z.object({
    orderId: z.number().int().positive(),
    method: z.enum(['upi', 'card', 'netbanking', 'wallet', 'cod'])
});

export const VerifyPaymentSchema = z.object({
    gatewayOrderId: z.string().min(1),
    paymentId: z.string().min(1),
    signature: z.string().min(1)
});

export const RefundSchema = z.object({
    amount: z.number().int().positive().optional(),
    reason: z.string().optional()
});

export type CreateIntentPayload = z.infer<typeof CreateIntentSchema>;
export type VerifyPaymentPayload = z.infer<typeof VerifyPaymentSchema>;
export type RefundPayload = z.infer<typeof RefundSchema>;
