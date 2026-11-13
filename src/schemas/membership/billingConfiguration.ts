import { z } from "zod";

/** Mirrors MembershipBillingConfigurationResponse; an empty configuration is HTTP 204. */
export const membershipBillingConfigurationSchema = z.object({
    id: z.number().int().positive(),
    chargeDefinitionId: z.number().int().positive(),
    enforcementEnabled: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string().nullable(),
});

// The client can change the reference, but cannot enable access enforcement.
export const updateMembershipBillingConfigurationSchema = z.object({
    chargeDefinitionId: z.number().int().positive("Selecione uma cobrança válida."),
}).strict();

export type MembershipBillingConfiguration = z.infer<typeof membershipBillingConfigurationSchema>;
export type UpdateMembershipBillingConfiguration = z.infer<typeof updateMembershipBillingConfigurationSchema>;
