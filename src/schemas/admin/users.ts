import { birthDateSchema } from "@/schemas/auth/user/birthDate";
import { isValidCPF } from "@/utils/validate/validateCPF";
import { isValidEmail } from "@/utils/validate/validateEmail";
import { getMediaImageUrl } from "@/utils/media/imageUrl";
import z from "zod";
import { pageResponseSchema } from "../page";

const BRAZILIAN_STATES = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
    "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
    "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

export const adminUserStatusSchema = z
    .enum(["ACTIVE", "INACTIVE", "ARCHIVED", "DISABLED"])
    .transform((status): UserStatus => (status === "DISABLED" ? "INACTIVE" : status));

export const adminUserSchema = z
    .object({
        id: z.number(),
        name: z.string(),
        birthDate: z.string().nullish().transform((value) => value ?? null),
        cpf: z.string(),
        email: z.string().nullish().transform((value) => value ?? null),
        membershipNumber: z.string().nullish().transform((value) => value ?? null),
        rg: z.string().nullish().transform((value) => value ?? null),
        phoneNumber: z.string().nullish().transform((value) => value ?? null),
        profilePhotoStorageKey: z.string().nullish().transform((value) => value ?? null),
        profilePhotoUrl: z.string().nullish(),
        status: adminUserStatusSchema,
        createdAt: z.string(),
        disabledAt: z.string().nullish().transform((value) => value ?? null),
        updatedAt: z.string().nullish().transform((value) => value ?? null),
    })
    .transform(({ profilePhotoStorageKey, profilePhotoUrl, ...user }) => ({
        ...user,
        profilePhotoStorageKey,
        // API nova retorna storageKey; profilePhotoUrl cobre respostas antigas durante rollout.
        profilePhotoUrl: getMediaImageUrl(profilePhotoStorageKey ?? profilePhotoUrl) || null,
    })) satisfies z.ZodType<AdminUser>;

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
        .max(150)
        .optional(),

    cpf: z
        .string()
        .trim()
        .regex(/^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/)
        .refine((value) => isValidCPF(value))
        .optional(),

    email: z
        .string()
        .trim()
        .min(1)
        .max(180)
        .optional(),

    phoneNumber: z
        .string()
        .trim()
        .min(1)
        .max(20)
        .refine((value) => /^\d{1,20}$/.test(value.replace(/\D/g, "")))
        .optional(),

    birthDate: birthDateSchema.optional(),

    rg: z
        .string()
        .trim()
        .min(1)
        .max(20)
        .optional(),

    membershipNumber: z
        .string()
        .trim()
        .min(1)
        .max(64)
        .regex(/^0*[1-9][0-9]*$/)
        .optional(),

    // ALL é um filtro apenas da interface; é removido antes de chamar a API.
    status: z
        .enum(["ACTIVE", "INACTIVE", "ARCHIVED", "DISABLED", "ALL"])
        .transform((value) => (value === "DISABLED" ? "INACTIVE" : value))
        .optional(),

    createdFrom: z.iso.datetime().optional(),

    createdTo: z.iso.datetime().optional(),

    updatedFrom: z.iso.datetime().optional(),

    updatedTo: z.iso.datetime().optional(),

    q: z
        .string()
        .trim()
        .min(1)
        .max(150)
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
        .max(50)
        .optional(),

    sort: z
        .string()
        .max(100)
        .regex(/^[a-zA-Z][a-zA-Z0-9_]*,(asc|desc|ASC|DESC)$/)
        .optional(),
});

export const adminUpdateUserFormSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "O nome é obrigatório")
        .max(150, "O nome deve ter até 150 caracteres"),
    cpf: z
        .string()
        .trim()
        .min(1, "O CPF é obrigatório")
        .regex(/^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/, "CPF deve estar no formato 00000000000 ou 000.000.000-00")
        .refine((value) => isValidCPF(value), "O CPF é inválido"),
    birthDate: z.union([birthDateSchema, z.literal("")]).optional(),
    email: z
        .string()
        .trim()
        .max(180, "O e-mail deve ter até 180 caracteres")
        .refine((value) => !value || isValidEmail(value.toLowerCase()), "Informe um e-mail válido")
        .optional(),
    rg: z
        .string()
        .trim()
        .max(20, "O RG deve ter até 20 caracteres")
        .optional(),
    phoneNumber: z
        .string()
        .trim()
        .max(20, "O telefone deve ter até 20 caracteres")
        .optional(),
});

export type AdminUpdateUserFormData = z.infer<typeof adminUpdateUserFormSchema>;

export const adminUserComplementaryProfileSchema: z.ZodType<AdminUserComplementaryProfile> = z.object({
    workProfile: z
        .object({
            occupation: z.string().nullable(),
            workplace: z.string().nullable(),
        })
        .nullable(),
    address: z
        .object({
            postalCode: z.string().nullable(),
            street: z.string().nullable(),
            number: z.string().nullable(),
            complement: z.string().nullable(),
            neighborhood: z.string().nullable(),
            city: z.string().nullable(),
            state: z.string().nullable(),
        })
        .nullable(),
    profileCompletionPending: z.boolean(),
    membershipNumber: z.string().nullish().transform((value) => value ?? null),
});

export const adminUserComplementaryProfileFormSchema = z.object({
    occupation: z.string().trim().max(150, "Use até 150 caracteres").optional(),
    workplace: z.string().trim().max(150, "Use até 150 caracteres").optional(),
    postalCode: z
        .string()
        .trim()
        .refine((value) => !value || /^\d{5}-?\d{3}$/.test(value), "Informe um CEP válido (00000-000)")
        .optional(),
    street: z.string().trim().max(150, "Use até 150 caracteres").optional(),
    number: z.string().trim().max(20, "Use até 20 caracteres").optional(),
    complement: z.string().trim().max(150, "Use até 150 caracteres").optional(),
    neighborhood: z.string().trim().max(100, "Use até 100 caracteres").optional(),
    city: z.string().trim().max(100, "Use até 100 caracteres").optional(),
    state: z
        .string()
        .trim()
        .transform((value) => value.toUpperCase())
        .refine(
            (value) => !value || (BRAZILIAN_STATES as readonly string[]).includes(value),
            "Informe uma UF válida (ex.: SP)",
        )
        .optional(),
});

export type AdminUserComplementaryProfileFormData = z.infer<typeof adminUserComplementaryProfileFormSchema>;

export const adminUserDeletionHistorySchema: z.ZodType<AdminUserDeletionHistory> = z.object({
    originalId: z.number(),
    previousStatus: adminUserStatusSchema,
    createdAt: z.string(),
    disabledAt: z.string().nullish().transform((value) => value ?? null),
    archivedAt: z.string().nullish().transform((value) => value ?? null),
    updatedAt: z.string().nullish().transform((value) => value ?? null),
    deletedByUserId: z.number().nullish().transform((value) => value ?? null),
    deletedAt: z.string(),
    reason: z.string().nullish().transform((value) => value ?? null),
    schemaVersion: z.number(),
});
