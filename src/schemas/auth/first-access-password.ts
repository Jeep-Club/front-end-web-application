import { z } from "zod";
import { PasswordSchema } from "@/schemas/auth/user/password";

export const firstAccessPasswordSchema = z.object({
    password: PasswordSchema.max(72, "A senha deve ter no máximo 72 caracteres"),
    confirmPassword: z.string().min(1, "Confirme a nova senha"),
}).refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem",
});

export type FirstAccessPasswordForm = z.infer<typeof firstAccessPasswordSchema>;
