import z from "zod";


export const adminUserSchema = z.object({
    id: z.number(),
    name: z.string(),
    cpf: z.string(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    status: z.enum(["ACTIVE", "LOCKED", "DISABLED", "PENDING_FIRST_ACCESS", "CHANGE_PASSWORD_REQUIRED"]),
    passwordChangeRequired: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string().nullable(),
}) satisfies z.ZodType<AdminUser>;

export const adminUserListResponseSchema = z.array(adminUserSchema) satisfies z.ZodType<AdminUser[]>;