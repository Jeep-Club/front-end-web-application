import z from "zod";
import { pageResponseSchema } from "../page";


export const adminUserSchema = z.object({
    id: z.number(),
    name: z.string(),
    birthDate: z.string().nullable(),
    cpf: z.string(),
    email: z.string().nullable(),
    rg: z.string().nullable(),
    phoneNumber: z.string().nullable(),
    profilePhotoUrl: z.string().nullable(),
    status: z.enum(["ACTIVE", "DISABLED"]),
    createdAt: z.string(),
    disabledAt: z.string().nullable(),
    updatedAt: z.string().nullable(),
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

    birthDate: z.iso.date().optional(),

    rg: z
        .string()
        .trim()
        .max(20)
        .optional(),

    status: z
        .enum(["ACTIVE", "DISABLED"])
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

// export const userRegisterSchema = z.object({
//   name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
//   birthData: z.string().min(1, "A data de nascimento é obrigatória"), // Pode aplicar um regex de data se necessário
//   email: z.email("Formato de e-mail inválido"),
//   cpf: z.string().min(11, "O CPF é obrigatório e deve ter 11 dígitos"),
//   rg: z.string().min(1, "O RG é obrigatório"),
//   password: z.string()
//     .min(8, "A senha deve ter no mínimo 8 caracteres"),
//     // .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
//     // .regex(/[^a-zA-Z0-9]/, "A senha deve conter pelo menos um caractere especial"),
//   phoneNumber: z.string().min(10, "Telefone inválido")
// }) satisfies z.ZodType<RegisterRequest>;
