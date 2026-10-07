import z from "zod";

export const meResponseSchema: z.ZodType<MeResponse> = z.object({
    userId: z.number(),
    sessionId: z.number(),
    sessionActive: z.boolean(),
    expiresInSeconds: z.number()
});

export const identityMeResponseSchema = z.object({
    id: z.number(),
    name: z.string(),
    birthDate: z.string().nullable(),
    email: z.string(),
    cpf: z.string(),
    rg: z.string().nullable(),
    phoneNumber: z.string().nullable(),
    profilePhotoStorageKey: z.string().nullable(),
    status: z.enum(['ACTIVE', 'DISABLED']),
    createdAt: z.string(),
    disabledAt: z.string().nullable(),
    updatedAt: z.string().nullable()
}) satisfies z.ZodType<IdentityMeResponse>; 

export const authorizationMeResponseSchema: z.ZodType<AuthorizationMeResponse> = z.object({
    userId: z.number(),
    authorities: z.array(z.string())
});

export const meCookieSchema: z.ZodType<MeCookie> = z.object({
    userId: z.number(),
    userName: z.string(),
    sessionId: z.number(),
    sessionActive: z.boolean(),
    expires: z.string()
});