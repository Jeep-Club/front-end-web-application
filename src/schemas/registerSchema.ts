import { z } from 'zod';


export const registerFormSchema = z.object({
    fullName: z.string().min(3, 'Nome completo obrigatório'),
    nickname: z.string().optional(),
    cpf: z.string()
        .min(14, 'CPF inválido')
        .max(14, 'CPF inválido'),
    cnh: z.string().optional(),
    birthDate: z.string().min(1, 'Data de nascimento obrigatória'),
    phone: z.string().min(14, 'Telefone inválido'),
    memberSince: z.string().optional(),
    state: z.string().min(1, 'Estado obrigatório'),
    city: z.string().min(1, 'Cidade obrigatória'),
    email: z.string().email('E-mail inválido').optional(),
    name: z.string().min(1, 'Nome obrigatório'),
});

export type RegisterFormData = z.infer<typeof registerFormSchema>;

export const registerResponseSchema = z.object({
    AuthAccessToken: z.string(),
    AuthRefreshToken: z.string(),
    AccessTokenExpiration: z.string(),
});

export type RegisterResponse = z.infer<typeof registerResponseSchema>;