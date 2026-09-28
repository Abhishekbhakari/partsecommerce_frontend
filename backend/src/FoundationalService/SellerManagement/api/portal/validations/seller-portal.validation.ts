import { z } from 'zod';

export const FulfillmentUpdateSchema = z.object({
    status: z.enum(['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed']),
    /** URLs returned by POST /seller/uploads/image. Required (≥1) when dispatching an item for the
     *  first time and when marking it delivered — enforced in the service, not here, because
     *  whether proof is needed depends on the item's current state, which Zod can't see. */
    proofImages: z.array(z.string().url()).max(6, 'Attach at most 6 photos').optional(),
    note: z.string().max(500).optional()
});

export type FulfillmentUpdatePayload = z.infer<typeof FulfillmentUpdateSchema>;
