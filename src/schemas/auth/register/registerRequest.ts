import z from "zod";
import { emailSchema, cpfSchema, birthDateSchema, PasswordSchema } from "@/schemas/auth/user/";

export const registerRequestSchema = z.object({
    name: z.string().min(1, 'O nome é obrigatório'),
    birthData: birthDateSchema,
    email: emailSchema,
    cpf: cpfSchema,
    password: PasswordSchema,
    phoneNumber: z.string().min(10, 'O número de telefone é obrigatório')
}) satisfies z.ZodType<RegisterRequest>;

const termsAcceptanceMessage = "Você precisa aceitar os Termos de Uso para se cadastrar.";

export const registerSubmissionSchema = registerRequestSchema.extend({
    termsAccepted: z.boolean({ error: termsAcceptanceMessage }).refine(
        (accepted) => accepted,
        { message: termsAcceptanceMessage },
    ),
});

export type RegisterSubmission = z.infer<typeof registerSubmissionSchema>;
