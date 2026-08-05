import { z } from "zod";

export const createRoleRequestSchema: z.ZodType<CreateRoleRequest> = z.object({
    name: z.string().trim()
        .min(1, { message: "Nome da role é obrigatório." })
        .max(100, { message: "Nome da role deve ter no máximo 100 caracteres." }),
    description: z.string()
        .max(255, { message: "Descrição da role deve ter no máximo 255 caracteres." })
        .optional(),
});

export const roleResponseSchema: z.ZodType<RoleResponse> = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    status: z.enum(["ACTIVE", "INACTIVE", "DELETED"]),
    createdAt: z.string(),
    updatedAt: z.string().nullable(),
    deletedAt: z.string().nullable(),
});

export const roleListResponseSchema = z.array(roleResponseSchema);
