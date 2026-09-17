import { z } from 'zod';

export const SellerRegisterSchema = z.object({
    businessName: z.string().min(1, 'Business name is required'),
    email: z.string().email('Invalid email format').trim(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    phone: z.string().min(6, 'A valid phone number is required'),
    gstNumber: z.string().nullable().optional()
});

export const SellerLoginSchema = z.object({
    email: z.string().email('Invalid email format').trim(),
    password: z.string().min(1, 'Password is required')
});

export type SellerRegisterPayload = z.infer<typeof SellerRegisterSchema>;
export type SellerLoginPayload = z.infer<typeof SellerLoginSchema>;
