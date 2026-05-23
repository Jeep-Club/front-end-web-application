import z from 'zod';

export const refreshRequestSchema: z.ZodType<RefreshTokenRequest> = z.object({
    refreshToken: z.string()
});