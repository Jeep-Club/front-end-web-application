import { z } from 'zod';

export const passwordRecoveryResponseSchema = z.object({
    status: z.enum(['OPEN', 'RESOLVED', 'CANCELLED']),
    method: z.enum(['UNDEFINED', 'EMAIL_TOKEN', 'ADMIN_RESET_LINK', 'ADMIN_TEMPORARY_PASSWORD']),
    createdAt: z.string(),
    expiresAt: z.string(),
    resolvedAt: z.string().nullable(),
    cancelledAt: z.string().nullable(),
});

export const adminTemporaryPasswordResponseSchema = passwordRecoveryResponseSchema.extend({
    temporaryPassword: z.string().min(1),
});

export type AdminTemporaryPasswordResponse = z.infer<typeof adminTemporaryPasswordResponseSchema>;
