import { z } from "zod";
import { birthDateSchema, cpfSchema, emailSchema } from "@/schemas/auth/user";

export const adminFirstAccessUserSchema: z.ZodType<AdminFirstAccessUserRequest> = z.object({
    name: z.string().trim().min(1, "O nome é obrigatório").max(150),
    birthDate: birthDateSchema.nullable(),
    email: emailSchema,
    cpf: cpfSchema,
    rg: z.string().trim().max(20).nullable().optional().transform((value) => value ?? null),
    phoneNumber: z.string().trim().min(10, "O telefone é obrigatório").max(20),
});

export const adminFirstAccessUserResponseSchema: z.ZodType<AdminFirstAccessUserResponse> = z.object({
    userId: z.number(),
    temporaryPassword: z.string().min(1),
});
