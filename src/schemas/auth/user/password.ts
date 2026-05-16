import { z } from 'zod';
// import { isValidPassword } from '@/utils/validate';

export const PasswordSchema = z.string()
    .min(1, "A senha é obrigatória")
    .min(8, "A senha deve conter no mínimo 8 caracteres")
    .regex(/\d/, "Deve conter pelo menos um número")
    .regex(/[a-z]/, "Deve conter pelo menos uma letra minúscula")
    .regex(/[A-Z]/, "Deve conter pelo menos uma letra maiúscula")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Deve conter pelo menos um caractere especial")
    // .refine((password) => isValidPassword(password), {
    //     message: "A senha não atende aos critérios de segurança"
    // });

export type Password = z.infer<typeof PasswordSchema>;