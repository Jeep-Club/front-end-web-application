import z from "zod";

export const loginResponseSchema: z.ZodType<LoginResponse> = z.object({
    AuthAccessToken: z.string(),
    AuthRefreshToken: z.string(),
    AccessTokenExpiration: z.string(),
});