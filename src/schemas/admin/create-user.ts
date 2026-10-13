import { z } from "zod";
import { birthDateSchema, cpfSchema } from "@/schemas/auth/user";
import { isValidEmail } from "@/utils/validate/validateEmail";

export const adminCreateUserFormSchema: z.ZodType<AdminCreateUserForm> = z.object({
    name: z.string().trim().min(1, "O nome é obrigatório").max(150, "O nome deve ter até 150 caracteres"),
    birthDate: z.union([birthDateSchema, z.literal("")]),
    email: z.string().max(180, "O e-mail deve ter até 180 caracteres").refine(
        (value) => !value || isValidEmail(value),
        "Informe um e-mail válido",
    ),
    cpf: cpfSchema,
    rg: z.string().max(20, "O RG deve ter até 20 caracteres"),
    phoneNumber: z.string().max(20, "O telefone deve ter até 20 caracteres"),
    activationMethod: z.union([
        z.literal("TEMPORARY_PASSWORD"),
        z.literal("EMAIL_INVITATION"),
        z.literal(""),
    ]),
}).superRefine((data, context) => {
    if (!data.activationMethod) {
        context.addIssue({
            code: "custom",
            path: ["activationMethod"],
            message: "Selecione como o usuário vai ativar a conta",
        });
    }

    if (data.activationMethod === "EMAIL_INVITATION" && !data.email.trim()) {
        context.addIssue({
            code: "custom",
            path: ["email"],
            message: "O e-mail é obrigatório para enviar o convite",
        });
    }
});

export const adminCreateUserResponseSchema: z.ZodType<AdminCreateUserResponse> = z.discriminatedUnion("activationMethod", [
    z.object({
        userId: z.number(),
        activationMethod: z.literal("TEMPORARY_PASSWORD"),
        temporaryPassword: z.string().min(1),
    }),
    z.object({
        userId: z.number(),
        activationMethod: z.literal("EMAIL_INVITATION"),
        invitationStatus: z.enum(["QUEUED", "SENT", "DELIVERY_FAILED", "REVOKED"]),
    }),
]);

export const adminUserInvitationStatusResponseSchema: z.ZodType<AdminUserInvitationStatusResponse> = z.object({
    userId: z.number(),
    invitationStatus: z.enum(["QUEUED", "SENT", "DELIVERY_FAILED", "REVOKED"]),
});
