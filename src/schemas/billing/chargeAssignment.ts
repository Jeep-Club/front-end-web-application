import { z } from "zod";

export const chargeAudienceTypeSchema: z.ZodType<ChargeAudienceType> = z.enum([
    "ALL_MEMBERS",
    "USER",
    "ROLE",
    "EVENT_PARTICIPANTS",
]);

export const chargeAssignmentResponseSchema: z.ZodType<ChargeAssignment> = z.object({
    id: z.number(),
    chargeDefinitionId: z.number(),
    audienceType: chargeAudienceTypeSchema,
    userId: z.number().nullable(),
    roleId: z.number().nullable(),
    eventId: z.number().nullable(),
    active: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string().nullable(),
});
