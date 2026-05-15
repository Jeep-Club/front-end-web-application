import z from "zod";
export const registerRequestSchema: z.ZodType<RegisterRequest> = z.object({
    name: z.string().min(1, 'O nome é obrigatório'),
    birthData: z.string('A data de nascimento é inválida').transform(date => new Date(date).toISOString().split('T')[0]),
    email: z.email('O email é inválido'),
    cpf: z.string().min(11, 'O CPF deve ter pelo menos 11 caracteres'),
    rg: z.string().min(1, 'O RG é obrigatório'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    phoneNumber: z.string().min(10, 'O número de telefone é obrigatório')
})