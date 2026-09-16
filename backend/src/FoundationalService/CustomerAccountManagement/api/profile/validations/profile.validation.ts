import { z } from 'zod';

export const UpdateProfileSchema = z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(6).optional()
});

export type UpdateProfilePayload = z.infer<typeof UpdateProfileSchema>;
