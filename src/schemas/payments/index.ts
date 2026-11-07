import { z } from "zod";

export const paymentStatusSchema = z.enum(["PENDING_VALIDATION", "CONFIRMED", "REJECTED", "CANCELED"]);
export const paymentMethodSchema = z.enum(["PIX", "CASH", "BANK_TRANSFER", "CREDIT_CARD", "DEBIT_CARD", "OTHER"]);
export const paymentIdSchema = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);

export const paymentFiltersSchema = z.object({
    status: paymentStatusSchema.optional(),
    page: z.number().int().min(0).default(0),
    size: z.number().int().min(1).max(50).default(20),
});

export const rejectPaymentSchema = z.object({
    rejectionReason: z.string().trim().min(1, "Informe o motivo da rejeição.").max(500, "O motivo deve ter no máximo 500 caracteres."),
});

export const paymentSummarySchema = z.object({
    id: paymentIdSchema,
    memberChargeId: paymentIdSchema,
    amount: z.number(),
    paymentMethod: paymentMethodSchema,
    status: paymentStatusSchema,
    paidAt: z.string(),
    receiptUrl: z.string(),
    createdAt: z.string(),
});

export const paymentDetailSchema = paymentSummarySchema.extend({
    confirmedAt: z.string().nullable(),
    confirmedByUserId: paymentIdSchema.nullable(),
    rejectedAt: z.string().nullable(),
    rejectedByUserId: paymentIdSchema.nullable(),
    rejectionReason: z.string().nullable(),
    canceledAt: z.string().nullable(),
    notes: z.string().nullable(),
    updatedAt: z.string().nullable(),
});

export const paymentPageSchema = z.object({
    content: z.array(paymentSummarySchema),
    number: z.number().int().nonnegative(),
    size: z.number().int().positive(),
    totalElements: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    numberOfElements: z.number().int().nonnegative(),
    first: z.boolean(),
    last: z.boolean(),
    empty: z.boolean(),
});

export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type PaymentFilters = z.infer<typeof paymentFiltersSchema>;
export type PaymentSummary = z.infer<typeof paymentSummarySchema>;
export type PaymentDetail = z.infer<typeof paymentDetailSchema>;
export type PaymentPage = z.infer<typeof paymentPageSchema>;
