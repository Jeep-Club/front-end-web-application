import z from 'zod';

export const refreshTokenResponseSchema: z.ZodType<RefreshTokenResponse> = z.object({
    refreshToken: z.string(),
    accessToken: z.string(),
    expiresInSeconds: z.number()
});