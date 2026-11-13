import { z } from 'zod';
// import { isValidPassword } from '@/utils/validate';

export const PasswordSchema = z.string()
    .min(1, "A senha é obrigatória")
    .min(8, "A senha deve conter no mínimo 8 caracteres");

export type Password = z.infer<typeof PasswordSchema>;
