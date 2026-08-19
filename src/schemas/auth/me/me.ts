import z from "zod";

export const meResponseSchema: z.ZodType<MeResponse> = z.object({
    userId: z.number(),
    userName: z.string(),
    sessionId: z.number(),
    sessionActive: z.boolean(),
    expiresInSeconds: z.number(),
    authorities: z.array(z.string())
});

export const meCookieSchema: z.ZodType<MeCookie> = z.object({
    userId: z.number(),
    userName: z.string(),
    sessionId: z.number(),
    sessionActive: z.boolean(),
    expires: z.string()
});