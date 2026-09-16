import { z } from 'zod';

export const AdminLoginSchema = z.object({
    email: z.string().email('Invalid email format').trim(),
    password: z.string().min(1, 'Password is required')
});

export type AdminLoginPayload = z.infer<typeof AdminLoginSchema>;
