import { z } from "zod";

export const forgotPasswordRequestSchema = z.object({
    cpf: z.string()
        // 1. Primeiro, removemos tudo que não for número (tira os pontos e o traço)
        .transform((val) => val.replace(/\D/g, ''))
        // 2. Depois, validamos se o resultado limpo tem exatamente 11 caracteres
        .refine((val) => val.length === 11, {
            message: "Por favor, insira um CPF válido.",
        }),
});

export type ForgotPasswordRequestType = z.infer<typeof forgotPasswordRequestSchema>;