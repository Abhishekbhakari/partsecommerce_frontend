import { z } from 'zod';

export const CreateShipmentSchema = z.object({
    orderId: z.number().int().positive()
});

export type CreateShipmentPayload = z.infer<typeof CreateShipmentSchema>;
