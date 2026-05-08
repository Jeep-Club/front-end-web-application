import { z } from 'zod';
import { validateCPF } from '@/utils/validateCPF';

export const registerFormSchema = z.object({
    fullName: z.string().min(3, 'Nome completo obrigatório'),
    nickname: z.string().optional(),
    cpf: z.string()
        .min(14, 'CPF inválido')
        .max(14, 'CPF inválido')
        .refine(validateCPF, 'CPF inválido'),
    rg: z.string().min(1, 'RG obrigatório'),
    cnh: z.string().optional(),
    birthDate: z.string().min(1, 'Data de nascimento obrigatória'),
    phone: z.string().min(14, 'Telefone inválido'),
    memberSince: z.string().optional(),
    state: z.string().min(1, 'Estado obrigatório'),
    city: z.string().min(1, 'Cidade obrigatória'),
    email: z.string().email('E-mail inválido').optional(),
    password: z.string()
        .min(8, 'Mínimo 8 caracteres')
        .regex(/[A-Z]/, 'Precisa ter pelo menos 1 letra maiúscula')
        .regex(/[a-z]/, 'Precisa ter pelo menos 1 letra minúscula')
        .regex(/[0-9]/, 'Precisa ter pelo menos 1 número'),
});

export type RegisterFormData = z.infer<typeof registerFormSchema>;

export const registerResponseSchema = z.object({
    AuthAccessToken: z.string(),
    AuthRefreshToken: z.string(),
    AccessTokenExpiration: z.string(),
});

export type RegisterResponse = z.infer<typeof registerResponseSchema>;