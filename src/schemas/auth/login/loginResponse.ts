import z from "zod";

export const loginResponseSchema: z.ZodType<LoginResponse> = z.object({
    status: z.string()
}).and(
    z.union([
        z.object({
            refreshToken: z.string(),
            accessToken: z.string(),
            expiresInSeconds: z.number()
        }),
        z.object({
            passwordChangeToken: z.string(),
            passwordChangeTokenExpiresAt: z.string()
        })
    ])
);

export const loginResponsePasswordSchema: z.ZodType<LoginResponsePassword> = z.object({
    passwordChangeToken: z.string(),
    passwordChangeTokenExpiresAt: z.string()
});

export const loginResponseAuthSchema: z.ZodType<AuthResponse> = z.object({
    refreshToken: z.string(),
    accessToken: z.string(),
    expiresInSeconds: z.number()
});