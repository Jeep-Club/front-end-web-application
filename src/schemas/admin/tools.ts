import { z } from "zod";
import { toolStatusSchema } from "@/schemas/tools/list";
import { toolPhotoFields } from "@/schemas/tools/photo";

export const adminToolListItemSchema: z.ZodType<AdminToolListItem> = z.object({
    id: z.number(),
    name: z.string(),
    status: toolStatusSchema,
    userId: z.number(),
    photoStorageKey: z.string().nullable().optional(),
});

export const listAdminToolsResponseSchema: z.ZodType<ListAdminToolsResponse> = z.object({
    content: z.array(adminToolListItemSchema),
    totalElements: z.number(),
    totalPages: z.number(),
    number: z.number(),
    size: z.number(),
    first: z.boolean(),
    last: z.boolean(),
    numberOfElements: z.number(),
    empty: z.boolean(),
});

export const createAdminToolFormSchema: z.ZodType<CreateAdminToolFormData> = z.object({
    ...toolPhotoFields,
    userId: z
        .union([z.string(), z.number()])
        .transform((value) => String(value).trim())
        .refine((value) => value.length > 0, { message: "O ID do associado é obrigatório" })
        .transform((value) => Number(value))
        .pipe(
            z
                .number({ message: "Informe um ID numérico válido" })
                .int({ message: "O ID do associado deve ser um número inteiro" })
                .gt(0, { message: "O ID do associado deve ser maior que zero" }),
        ),
    name: z
        .string()
        .trim()
        .min(1, { message: "O nome da ferramenta é obrigatório" })
        .max(100, { message: "O nome deve ter no máximo 100 caracteres" }),
    description: z
        .string()
        .trim()
        .max(500, { message: "A descrição deve ter no máximo 500 caracteres" })
        .optional(),
});
