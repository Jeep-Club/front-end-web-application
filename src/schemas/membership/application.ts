import { z } from "zod";
import { isValidCPF } from "@/utils/validate/validateCPF";
import { isValidEmail } from "@/utils/validate/validateEmail";

const CPF_FORMAT_REGEX = /^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/;
const BR_MOBILE_PHONE_REGEX = /^(?:\+55\s?)?(?:\([1-9]{2}\)|[1-9]{2})\s?9\d{4}[-\s]?\d{4}$/;

export const membershipApplicationFormSchema: z.ZodType<MembershipApplicationForm> = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Nome é obrigatório.")
        .max(150, "Nome deve ter no máximo 150 caracteres."),
    cpf: z
        .string()
        .trim()
        .min(1, "CPF é obrigatório.")
        .regex(CPF_FORMAT_REGEX, "CPF deve estar no formato 00000000000 ou 000.000.000-00.")
        .refine((value) => isValidCPF(value), "CPF inválido."),
    phoneNumber: z
        .string()
        .trim()
        .min(1, "Telefone é obrigatório.")
        .regex(BR_MOBILE_PHONE_REGEX, "Telefone deve ser um celular brasileiro com DDD."),
    email: z
        .string()
        .trim()
        .max(180, "E-mail deve ter no máximo 180 caracteres.")
        .refine((value) => !value || isValidEmail(value.toLowerCase()), "E-mail inválido.")
        .optional(),
    message: z
        .string()
        .trim()
        .max(2000, "Mensagem deve ter no máximo 2000 caracteres.")
        .optional(),
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
