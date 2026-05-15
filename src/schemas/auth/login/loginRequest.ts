import { z } from "zod";
import { cpfSchema } from "@/schemas/auth/user/cpf";

export const loginRequestSchema: z.ZodType<LoginRequest> = z.object({
    cpf: cpfSchema,

    senha: z.string().min(1, {
        message: "Informe a senha"
    })
})

export type LoginRequestType = z.infer<typeof loginRequestSchema>;