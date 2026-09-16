import { z } from 'zod';

export const AddressSchema = z.object({
    label: z.string().optional(),
    line1: z.string().min(1, 'Address line 1 is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    pincode: z.string().min(4, 'Valid pincode is required'),
    country: z.string().optional().default('IN'),
    phone: z.string().min(6, 'Valid phone is required'),
    isDefault: z.boolean().optional()
});

export const UpdateAddressSchema = AddressSchema.partial();

export type AddressPayload = z.infer<typeof AddressSchema>;
export type UpdateAddressPayload = z.infer<typeof UpdateAddressSchema>;
