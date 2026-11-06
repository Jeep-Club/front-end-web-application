import { z } from "zod";

export const adminMemberRegistrationSchema = z.object({
    id: z.number().int().positive(),
    identityUserId: z.number().int().positive(),
    membershipNumber: z.string().min(1).max(64),
    createdAt: z.string(),
    updatedAt: z.string(),
    version: z.number().int().nonnegative(),
}) satisfies z.ZodType<AdminMemberRegistration>;

const membershipNumberSchema = z
    .string()
    .trim()
    .min(1, "Informe a matrícula.")
    .max(64, "A matrícula deve ter até 64 dígitos.")
    .regex(/^0*[1-9][0-9]*$/, "Informe um número decimal positivo, sem letras ou símbolos.");

const reasonSchema = z
    .string()
    .trim()
    .min(1, "Informe o motivo da alteração.")
    .max(500, "O motivo deve ter até 500 caracteres.")
    .refine((value) => !/[\u0000-\u001F\u007F]/.test(value), "Remova caracteres de controle do motivo.");

export const adminMemberRegistrationFormSchema = z.object({
    membershipNumber: membershipNumberSchema,
    reason: reasonSchema,
});

export const updateAdminMemberRegistrationSchema = z.discriminatedUnion("mode", [
    z.object({
        mode: z.literal("ASSIGN"),
        userId: z.number().int().positive(),
        membershipNumber: membershipNumberSchema,
        reason: reasonSchema,
    }),
    z.object({
        mode: z.literal("CORRECT"),
        userId: z.number().int().positive(),
        membershipNumber: membershipNumberSchema,
        expectedVersion: z.number().int().nonnegative(),
        reason: reasonSchema,
    }),
]);

export type UpdateAdminMemberRegistrationInput = z.infer<typeof updateAdminMemberRegistrationSchema>;
