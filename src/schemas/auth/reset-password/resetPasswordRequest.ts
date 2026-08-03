import { z } from "zod";

export const resetPasswordRequestSchema = z.object({
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"], // Direciona a mensagem de erro para o campo de confirmação
});

export type ResetPasswordRequestType = z.infer<typeof resetPasswordRequestSchema>;