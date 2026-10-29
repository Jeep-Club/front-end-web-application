import { z } from "zod";

export const chargeRecurrenceTypeSchema: z.ZodType<ChargeRecurrenceType> = z.enum([
    "ONE_TIME",
    "MONTHLY",
    "YEARLY",
]);

export const paymentAcceptancePolicySchema: z.ZodType<PaymentAcceptancePolicy> = z.enum([
    "UNTIL_DUE_DATE",
    "AFTER_DUE_DATE",
    "UNTIL_DAYS_AFTER_DUE_DATE",
]);

export const chargeDefinitionStatusSchema: z.ZodType<ChargeDefinitionStatus> = z.enum([
    "ACTIVE",
    "INACTIVE",
    "ARCHIVED",
]);

export const chargeDefinitionSummaryResponseSchema: z.ZodType<ChargeDefinitionSummary> = z.object({
    id: z.number(),
    name: z.string(),
    defaultAmount: z.number(),
    recurrenceType: chargeRecurrenceTypeSchema,
    required: z.boolean(),
    paymentAcceptancePolicy: paymentAcceptancePolicySchema,
    latePaymentGraceDays: z.number().nullable(),
    status: chargeDefinitionStatusSchema,
});

export const chargeDefinitionResponseSchema: z.ZodType<ChargeDefinition> = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    defaultAmount: z.number(),
    recurrenceType: chargeRecurrenceTypeSchema,
    required: z.boolean(),
    paymentAcceptancePolicy: paymentAcceptancePolicySchema,
    latePaymentGraceDays: z.number().nullable(),
    status: chargeDefinitionStatusSchema,
    createdAt: z.string(),
    updatedAt: z.string().nullable(),
    archivedAt: z.string().nullable(),
});

export const chargeDefinitionFormSchema: z.ZodType<ChargeDefinitionFormData> = z.object({
    name: z.string().trim()
        .min(1, { message: "Nome da cobrança é obrigatório." })
        .max(120, { message: "Nome da cobrança deve ter no máximo 120 caracteres." }),
    description: z.string()
        .max(255, { message: "Descrição deve ter no máximo 255 caracteres." })
        .optional(),
    defaultAmount: z.string()
        .min(1, { message: "Valor padrão é obrigatório." })
        .transform((value) => Number(value))
        .pipe(
            z.number({ error: "Valor padrão inválido." })
                .gt(0, { message: "Valor padrão deve ser maior que zero." })
        ),
    recurrenceType: chargeRecurrenceTypeSchema,
    required: z.boolean(),
    paymentAcceptancePolicy: paymentAcceptancePolicySchema,
    latePaymentGraceDays: z.string()
        .optional()
        .transform((value) => (value ? Number(value) : undefined))
        .pipe(
            z.number().int()
                .positive({ message: "Dias de tolerância deve ser maior que zero." })
                .optional()
        ),
}).refine(
    (data) => data.paymentAcceptancePolicy !== "UNTIL_DAYS_AFTER_DUE_DATE" || Boolean(data.latePaymentGraceDays),
    {
        message: "Informe os dias de tolerância para esta política de pagamento.",
        path: ["latePaymentGraceDays"],
    },
) as unknown as z.ZodType<ChargeDefinitionFormData>;
