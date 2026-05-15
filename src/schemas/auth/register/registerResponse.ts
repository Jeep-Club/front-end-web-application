import z from "zod";

export const registerResponseSchema: z.ZodType<RegisterResponse> = z.object({
    refreshToken: z.string(),
    accessToken: z.string(),
    expiresInSeconds: z.number()
})