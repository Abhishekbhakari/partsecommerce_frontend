import { z } from 'zod';

export const BroadcastSchema = z.object({
    segment: z.string().min(1),
    channel: z.enum(['email', 'sms', 'whatsapp', 'in_app']),
    template: z.string().min(1),
    params: z.record(z.unknown()).optional()
});

export type BroadcastPayload = z.infer<typeof BroadcastSchema>;
