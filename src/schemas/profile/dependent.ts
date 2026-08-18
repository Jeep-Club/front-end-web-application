import { z } from "zod";
import { dependentSchema } from "@/schemas/admin/dependent";
import { unMaskCPF } from "@/utils/masks/maskCPF";
import { unMaskPhoneNumber } from "@/utils/masks/maskPhoneNumber";

export const dependentRelationshipTypeSchema: z.ZodType<DependentRelationshipType> = z.enum([
    'CHILD',
    'GUEST',
    'OTHER',
    'PARENT',
    'SIBLING',
    'SPOUSE',
]);

export const createDependentFormSchema: z.ZodType<CreateDependentFormData> = z.object({
    name: z.string()
        .trim()
        .min(1, { message: "O nome do dependente é obrigatório" })
        .max(150, { message: "O nome deve ter no máximo 150 caracteres" }),
    cpf: z.string()
        .min(1, { message: "O CPF do dependente é obrigatório" })
        .transform((value) => unMaskCPF(value))
        .pipe(z.string().length(11, { message: "CPF inválido" })),
    birthDate: z.string().optional(),
    relationshipType: z.string()
        .min(1, { message: "O parentesco é obrigatório" })
        .transform((value) => value as DependentRelationshipType),
    phoneNumber: z.string()
        .transform((value) => unMaskPhoneNumber(value))
        .optional(),
    consentAccepted: z.boolean()
        .refine((value) => value === true, { message: "É necessário aceitar o termo de consentimento LGPD" }),
});

export const createDependentResponseSchema: z.ZodType<CreateDependentResponse> = dependentSchema;
