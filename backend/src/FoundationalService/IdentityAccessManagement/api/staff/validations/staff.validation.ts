import { z } from 'zod';

export const InviteStaffSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    role: z.enum(['owner', 'manager', 'catalog_editor', 'order_manager', 'support'])
});

export const ChangeStaffRoleSchema = z.object({
    role: z.enum(['owner', 'manager', 'catalog_editor', 'order_manager', 'support'])
});

export type InviteStaffPayload = z.infer<typeof InviteStaffSchema>;
export type ChangeStaffRolePayload = z.infer<typeof ChangeStaffRoleSchema>;
