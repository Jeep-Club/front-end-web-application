import { z } from "zod";

export const forgotPasswordRequestSchema = z.object({
    cpf: z.string()
        .transform((val) => val.replace(/\D/g, ''))
        .refine((val) => val.length === 11, {
            message: "Por favor, insira um CPF válido.",
        }),
});

export type ForgotPasswordRequestType = z.infer<typeof forgotPasswordRequestSchema>;