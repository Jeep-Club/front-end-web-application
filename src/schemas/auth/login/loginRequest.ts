import { z } from "zod";

export const loginRequestSchema = z.object({
    cpf: z.string().min(1, {
        message: "Informe seu CPF"
    }),
    password: z.string().min(1, {
        message: "Informe a senha"
    })
})