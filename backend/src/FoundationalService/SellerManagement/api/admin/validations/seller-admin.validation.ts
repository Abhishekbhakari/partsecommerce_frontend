import { z } from 'zod';

export const SellerListQuerySchema = z.object({
    status: z.enum(['pending', 'approved', 'rejected', 'suspended']).optional(),
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().optional()
});

export const RejectSellerSchema = z.object({
    reason: z.string().min(1, 'A rejection reason is required')
});

export const SetCommissionSchema = z.object({
    // null clears the override so the seller falls back to the platform default rate.
    commissionRateOverride: z.number().min(0).max(100).nullable()
});

export const GeneratePayoutSchema = z.object({
    periodStart: z.string().min(1),
    periodEnd: z.string().min(1),
    notes: z.string().nullable().optional()
});

export type SellerListQuery = z.infer<typeof SellerListQuerySchema>;
export type RejectSellerPayload = z.infer<typeof RejectSellerSchema>;
export type SetCommissionPayload = z.infer<typeof SetCommissionSchema>;
export type GeneratePayoutPayload = z.infer<typeof GeneratePayoutSchema>;
