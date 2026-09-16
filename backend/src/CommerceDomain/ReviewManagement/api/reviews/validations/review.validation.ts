import { z } from 'zod';

export const CreateReviewSchema = z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional()
});

export const ModerateReviewSchema = z.object({
    status: z.enum(['pending', 'approved', 'rejected'])
});

export type CreateReviewPayload = z.infer<typeof CreateReviewSchema>;
export type ModerateReviewPayload = z.infer<typeof ModerateReviewSchema>;
