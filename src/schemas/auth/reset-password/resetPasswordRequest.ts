import { z } from "zod";

export const resetPasswordRequestSchema = z.object({
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres.").max(100, "A senha deve ter no máximo 100 caracteres."),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"], // Direciona a mensagem de erro para o campo de confirmação
});

export type ResetPasswordRequestType = z.infer<typeof resetPasswordRequestSchema>;
