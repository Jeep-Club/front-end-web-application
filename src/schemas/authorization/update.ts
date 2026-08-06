import { z } from "zod";

export const updateRoleRequestSchema: z.ZodType<UpdateRoleRequest> = z.object({
    name: z.string().trim()
        .min(1, { message: "Nome da role é obrigatório." })
        .max(100, { message: "Nome da role deve ter no máximo 100 caracteres." }),
    description: z.string()
        .max(255, { message: "Descrição da role deve ter no máximo 255 caracteres." })
        .optional(),
});
