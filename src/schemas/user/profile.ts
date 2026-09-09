import z from "zod";

export const userStatusSchema = z.enum([
    'ACTIVE',
    'DISABLED',
    'LOCKED',
    'CHANGE_PASSWORD_REQUIRED',
    'PENDING_FIRST_ACCESS',
]);

export const getUserProfileResponseSchema: z.ZodType<GetUserProfileResponse> = z.object({
    id: z.number(),
    name: z.string(),
    birthDate: z.string().nullable(),
    email: z.string(),
    cpf: z.string(),
    rg: z.string().nullable(),
    phoneNumber: z.string().nullable(),
    profilePhotoUrl: z.string().nullable(),
    status: userStatusSchema,
    createdAt: z.string(),
    lastLoginAt: z.string().nullable(),
});

export const meProfileResponseSchema: z.ZodType<MeProfileResponse> = z.object({
    id: z.number(),
    name: z.string(),
    birthDate: z.string().nullable(),
    email: z.string(),
    cpf: z.string(),
    rg: z.string().nullable(),
    phoneNumber: z.string().nullable(),
    profilePhotoUrl: z.string().nullable(),
    status: z.enum(['ACTIVE', 'DISABLED']),
    createdAt: z.string(),
    disabledAt: z.string().nullable(),
    updatedAt: z.string().nullable(),
});
