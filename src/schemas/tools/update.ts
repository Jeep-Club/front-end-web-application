import { z } from "zod";
import { toolDetailResponseSchema } from "./detail";

export const editToolFormSchema: z.ZodType<UpdateToolFormData> = z.object({
    name: z.string()
        .trim()
        .min(1, { message: "O nome da ferramenta é obrigatório" })
        .max(100, { message: "O nome deve ter no máximo 100 caracteres" }),
    description: z.string()
        .trim()
        .max(500, { message: "A descrição deve ter no máximo 500 caracteres" })
        .optional(),
});

export const updateToolResponseSchema: z.ZodType<UpdateToolResponse> = toolDetailResponseSchema;