import { z } from 'zod';

export const FulfillmentUpdateSchema = z.object({
    status: z.enum(['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed']),
    /** URLs returned by POST /seller/uploads/image. Required (≥1) when dispatching an item for the
     *  first time and when marking it delivered — enforced in the service, not here, because
     *  whether proof is needed depends on the item's current state, which Zod can't see. */
    proofImages: z.array(z.string().url()).max(6, 'Attach at most 6 photos').optional(),
    note: z.string().max(500).optional()
});

/** Where couriers collect this seller's parcels. The pincode drives every shipping quote for the
 *  seller's items, so it must be a real 6-digit Indian pincode. */
export const SellerProfileUpdateSchema = z.object({
    pickupAddress: z.object({
        line1: z.string().min(3, 'Enter the street address'),
        line2: z.string().optional(),
        city: z.string().min(2, 'Enter the city'),
        state: z.string().min(2, 'Enter the state'),
        pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
        phone: z.string().min(6, 'Enter a contact phone for the courier')
    })
});

export type SellerProfileUpdatePayload = z.infer<typeof SellerProfileUpdateSchema>;
export type FulfillmentUpdatePayload = z.infer<typeof FulfillmentUpdateSchema>;
