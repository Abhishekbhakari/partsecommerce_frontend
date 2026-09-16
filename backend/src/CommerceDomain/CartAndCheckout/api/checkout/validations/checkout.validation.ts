import { z } from 'zod';

const InlineAddressSchema = z.object({
    label: z.string().optional(),
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    pincode: z.string().min(4),
    country: z.string().optional().default('IN'),
    phone: z.string().min(6)
});

export const CheckoutSchema = z.object({
    addressId: z.number().int().positive().optional(),
    address: InlineAddressSchema.optional(),
    guestEmail: z.string().email().optional(),
    paymentMethod: z.enum(['upi', 'card', 'netbanking', 'wallet', 'cod']).optional()
});

export type CheckoutPayload = z.infer<typeof CheckoutSchema>;
