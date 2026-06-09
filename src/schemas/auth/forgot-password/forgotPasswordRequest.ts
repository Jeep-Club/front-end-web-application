import { z } from "zod";

export const forgotPasswordRequestSchema = z.object({
    cpf: z.string().min(11, "Por favor, insira um CPF válido."),
    // Adicione outras regras do CPF aqui se o seu InputCPF não tratar o mask automaticamente no submit
});

export type ForgotPasswordRequestType = z.infer<typeof forgotPasswordRequestSchema>;