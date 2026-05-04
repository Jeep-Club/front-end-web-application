import z from 'zod';

export const refreshTokenResponseSchema: z.ZodType<RefreshTokenResponse> = z.object({
    AuthAccessToken: z.string(),
    AuthRefreshToken: z.string(),
    AccessTokenExpiration: z.string(),
});