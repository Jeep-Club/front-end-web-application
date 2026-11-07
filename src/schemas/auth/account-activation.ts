import { z } from 'zod';

export const accountActivationSchema = z.object({
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres').max(72, 'A senha deve ter no máximo 72 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
}).refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem',
});

export type AccountActivationForm = z.infer<typeof accountActivationSchema>;
