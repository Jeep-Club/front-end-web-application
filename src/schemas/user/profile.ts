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

export const backendUserProfileResponseSchema = z.object({
    id: z.number(),
    name: z.string(),
    cpf: z.string(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    status: userStatusSchema,
    passwordChangeRequired: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string().nullable().optional(),
});
