import z from "zod";
import { emailSchema, cpfSchema, birthDateSchema, PasswordSchema } from "@/schemas/auth/user/";

export const registerRequestSchema: z.ZodType<RegisterRequest> = z.object({
    name: z.string().min(1, 'O nome é obrigatório'),
    birthData: birthDateSchema,
    email: emailSchema,
    cpf: cpfSchema,
    password: PasswordSchema,
    phoneNumber: z.string().min(10, 'O número de telefone é obrigatório')
})