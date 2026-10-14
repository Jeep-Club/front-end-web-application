import { z } from "zod";
import { cpfSchema } from "@/schemas/auth/user";
import { isValidEmail } from "@/utils/validate/validateEmail";

export const membershipApplicationFormSchema: z.ZodType<MembershipApplicationForm> = z.object({
    name: z.string().trim().min(1, "Informe seu nome completo.").max(150, "Use até 150 caracteres."),
    cpf: cpfSchema,
    phoneNumber: z.string()
        .min(1, "Informe seu celular com DDD.")
        .max(20, "O celular informado é muito longo.")
        .refine((value) => {
            const digits = value.replace(/\D/g, "");
            const nationalNumber = digits.length === 13 && digits.startsWith("55") ? digits.slice(2) : digits;
            return /^[1-9]\d9\d{8}$/.test(nationalNumber);
        }, "Informe um celular válido com DDD, incluindo o 9 inicial."),
    email: z.string().max(180, "Use até 180 caracteres.").refine((value) => !value || isValidEmail(value), "Informe um e-mail válido."),
    message: z.string().trim().min(1, "Conte um pouco sobre você e por que quer fazer parte do clube.").max(2000, "A apresentação pode ter até 2.000 caracteres."),
});

export const membershipApplicationSubmissionSchema: z.ZodType<MembershipApplicationSubmission> = z.object({
    id: z.number(),
    status: z.enum(["PENDING", "APPROVED", "REJECTED", "COMPLETED"]),
    created: z.boolean(),
});

export const membershipApplicationSchema: z.ZodType<MembershipApplication> = z.object({
    id: z.number(),
    userId: z.number().nullable().optional(),
    name: z.string(),
    cpf: z.string(),
    email: z.string().nullable(),
    phoneNumber: z.string(),
    message: z.string().nullable(),
    status: z.enum(["PENDING", "APPROVED", "REJECTED", "COMPLETED"]),
    rejectionReason: z.string().nullable(),
    requestedAt: z.string(),
    updatedAt: z.string(),
});

export const membershipApplicationPageSchema: z.ZodType<MembershipApplicationPage> = z.object({
    content: z.array(membershipApplicationSchema),
    number: z.number(),
    size: z.number(),
    totalElements: z.number(),
    totalPages: z.number(),
    numberOfElements: z.number(),
    first: z.boolean(),
    last: z.boolean(),
    empty: z.boolean(),
});

export const temporaryPasswordApprovalSchema: z.ZodType<TemporaryPasswordApproval> = z.object({
    userId: z.number(),
    temporaryPassword: z.string().min(1),
});

export const accessLinkApprovalSchema: z.ZodType<AccessLinkApproval> = z.object({ userId: z.number() });
