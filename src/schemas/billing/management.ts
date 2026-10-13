import { z } from "zod";

export const billingResources = ["cycles", "member-charges", "payments", "refunds"] as const;
export type BillingResource = typeof billingResources[number];
const nullableDate = z.string().nullish();
const nullableId = z.number().nullish();
const base = z.object({ id: z.number(), status: z.string() });
export const cycleSchema = base.extend({
    chargeDefinitionId: z.number(), chargeDefinitionNameSnapshot: z.string(), code: z.string(),
    dueDate: z.string(), status: z.enum(["GENERATED", "CANCELED", "FINISHED", "ARCHIVED"]),
    chargeDefinitionPaymentAcceptancePolicySnapshot: z.string(),
    chargeDefinitionLatePaymentGraceDaysSnapshot: z.number().nullish(),
    generatedAt: nullableDate, canceledAt: nullableDate, finishedAt: nullableDate, archivedAt: nullableDate,
    chargeDefinitionDescriptionSnapshot: z.string().nullish(),
    chargeDefinitionDefaultAmountSnapshot: z.number().optional(),
    chargeDefinitionRecurrenceTypeSnapshot: z.string().optional(),
    chargeDefinitionRequiredSnapshot: z.boolean().optional(),
    generatedByUserId: nullableId, canceledByUserId: nullableId, finishedByUserId: nullableId, archivedByUserId: nullableId,
    createdAt: nullableDate, updatedAt: nullableDate,
});
export const chargeSchema = base.extend({
    userId: z.number(), chargeDefinitionId: z.number(), chargeCycleId: z.number(),
    finalAmount: z.number(), originalAmount: z.number().optional(), dueDate: z.string(),
    paymentAcceptancePolicy: z.string(), paymentAllowedUntil: nullableDate,
    latePaymentGraceDays: z.number().nullish(),
    status: z.enum(["PENDING", "PAID", "CANCELED"]),
    effectiveStatus: z.enum(["PENDING", "OVERDUE", "EXPIRED", "PAID", "CANCELED"]),
    createdAt: nullableDate, updatedAt: nullableDate, paidAt: nullableDate, canceledAt: nullableDate,
});
export const paymentSchema = base.extend({
    paymentMethodLabel: z.string().optional(), statusLabel: z.string().optional(),
    memberChargeId: z.number(), amount: z.number(), paymentMethod: z.string(),
    status: z.enum(["PENDING_VALIDATION", "CONFIRMED", "REJECTED", "CANCELED"]),
    paidAt: nullableDate, receiptUrl: z.string().nullish(), createdAt: nullableDate, updatedAt: nullableDate,
    confirmedAt: nullableDate, confirmedByUserId: nullableId, rejectedAt: nullableDate,
    rejectedByUserId: nullableId, rejectionReason: z.string().nullish(), canceledAt: nullableDate, notes: z.string().nullish(),
});
export const refundSchema = base.extend({
    memberChargeId: z.number(), memberPaymentId: z.number(), chargeCycleId: z.number(), userId: z.number(),
    amount: z.number(), reason: z.string(),
    status: z.enum(["ELIGIBLE", "REQUESTED", "APPROVED", "REJECTED", "REFUNDED", "EXPIRED", "CANCELED"]),
    eligibleUntil: nullableDate, eligibleAt: nullableDate, requestedAt: nullableDate,
    createdAt: nullableDate, updatedAt: nullableDate, approvedAt: nullableDate, rejectedAt: nullableDate,
    refundedAt: nullableDate, canceledAt: nullableDate, rejectionReason: z.string().nullish(),
    createdByUserId: nullableId, requestedByUserId: nullableId, approvedByUserId: nullableId,
    rejectedByUserId: nullableId, refundedByUserId: nullableId, canceledByUserId: nullableId,
});
export const managementSchemas = { cycles: cycleSchema, "member-charges": chargeSchema, payments: paymentSchema, refunds: refundSchema };
export type BillingRecord = z.infer<typeof cycleSchema> | z.infer<typeof chargeSchema> | z.infer<typeof paymentSchema> | z.infer<typeof refundSchema>;
