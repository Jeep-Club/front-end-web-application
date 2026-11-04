import { z } from 'zod';

export const sessionSchema = z.object({
    id: z.number(),
    userId: z.number(),
    status: z.string(),
    createdAt: z.string(),
    expiresAt: z.string(),
    loggedOutAt: z.string().nullable(),
});

export const refreshTokenSchema = z.object({
    id: z.number(),
    userId: z.number(),
    sessionId: z.number(),
    status: z.string(),
    createdAt: z.string(),
    expiresAt: z.string(),
    replacedByTokenId: z.number().nullable(),
});

export const passwordRecoveryRequestSchema = z.object({
    id: z.number(),
    userId: z.number(),
    status: z.string(),
    method: z.string().nullable(),
    createdAt: z.string(),
    expiresAt: z.string(),
    resolvedAt: z.string().nullable(),
    cancelledAt: z.string().nullable(),
});

export type AdminSession = z.infer<typeof sessionSchema>;

export type AdminRefreshToken = z.infer<typeof refreshTokenSchema>;

export type AdminPasswordRecoveryRequest = z.infer<typeof passwordRecoveryRequestSchema>;
