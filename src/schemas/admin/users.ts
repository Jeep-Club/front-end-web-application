import z from "zod";
import { pageResponseSchema } from "../page";


export const adminUserSchema = z.object({
    id: z.number(),
    name: z.string(),
    cpf: z.string(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    accountStatus: z.enum(["ACTIVE", "LOCKED", "DISABLED", "PENDING_FIRST_ACCESS", "CHANGE_PASSWORD_REQUIRED"]),
    passwordChangeRequired: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string().nullable(),
    authenticationStatus: z.string(),
    credentialStatus: z.string(),
}) satisfies z.ZodType<AdminUser>;

export const adminUserListResponseSchema = pageResponseSchema(adminUserSchema) satisfies z.ZodType<PageResponse<AdminUser>>;


export const adminUserSearchParamsSchema = z.object({
    id: z.coerce
        .number()
        .int()
        .positive()
        .max(9_223_372_036)
        .optional(),

    name: z
        .string()
        .trim()
        .min(1)
        .max(100)
        .optional(),

    cpf: z
        .string()
        .regex(/^\d{11}$/)
        .optional(),

    email: z
        .email()
        .trim()
        .max(254)
        .optional(),

    phoneNumber: z
        .string()
        .regex(/^\d{10,11}$/)
        .optional(),

    accountStatus: z
        .enum(["ACTIVE", "DISABLED"])
        .optional(),

    authenticationStatus: z
        .enum(["ENABLED", "LOCKED"])
        .optional(),

    credentialStatus: z
        .enum([
            "PERMANENT",
            "PENDING_FIRST_ACCESS",
            "CHANGE_REQUIRED",
        ])
        .optional(),

    passwordChangeRequired: z
        .enum(["true", "false"])
        .optional(),

    createdFrom: z.iso.datetime().optional(),

    createdTo: z.iso.datetime().optional(),

    updatedFrom: z.iso.datetime().optional(),

    updatedTo: z.iso.datetime().optional(),

    q: z
        .string()
        .trim()
        .min(1)
        .max(100)
        .optional(),

    fields: z
        .string()
        .max(500)
        .optional(),

    page: z.coerce
        .number()
        .int()
        .min(0)
        .optional(),

    size: z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .optional(),

    sort: z
        .string()
        .max(100)
        .regex(
            /^[a-zA-Z][a-zA-Z0-9_]*,(asc|desc|ASC|DESC)$/
        )
        .optional(),
});