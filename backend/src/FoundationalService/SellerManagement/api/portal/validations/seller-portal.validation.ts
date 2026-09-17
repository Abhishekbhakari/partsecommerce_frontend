import { z } from 'zod';

export const FulfillmentUpdateSchema = z.object({
    status: z.enum(['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed'])
});

export type FulfillmentUpdatePayload = z.infer<typeof FulfillmentUpdateSchema>;
