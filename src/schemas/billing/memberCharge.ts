import { z } from "zod";

const memberChargeStatusSchema: z.ZodType<MemberChargeStatus> = z.enum([
    "PENDING",
    "PAID",
    "CANCELED",
]);

const memberChargeEffectiveStatusSchema: z.ZodType<MemberChargeEffectiveStatus> = z.enum([
    "PENDING",
    "OVERDUE",
    "EXPIRED",
    "PAID",
    "CANCELED",
]);

export const memberChargeSummaryResponseSchema: z.ZodType<MemberChargeSummary> = z.object({
    id: z.number(),
    userId: z.number(),
    chargeDefinitionId: z.number(),
    chargeCycleId: z.number(),
    finalAmount: z.number(),
    dueDate: z.string(),
    paymentAcceptancePolicy: z.enum([
        "UNTIL_DUE_DATE",
        "AFTER_DUE_DATE",
        "UNTIL_DAYS_AFTER_DUE_DATE",
    ]),
    paymentAllowedUntil: z.string().nullable(),
    status: memberChargeStatusSchema,
    effectiveStatus: memberChargeEffectiveStatusSchema,
});
