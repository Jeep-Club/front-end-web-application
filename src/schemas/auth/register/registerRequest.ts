import z from "zod";
import { emailSchema, cpfSchema, birthDateSchema } from "@/schemas/auth/user/";

export const registerRequestSchema: z.ZodType<RegisterRequest> = z.object({
    name: z.string().min(1, 'O nome é obrigatório'),
    birthData: birthDateSchema,
    email: emailSchema,
    cpf: cpfSchema,
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    phoneNumber: z.string().min(10, 'O número de telefone é obrigatório')
})