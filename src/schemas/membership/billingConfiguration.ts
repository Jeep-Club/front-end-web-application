import { z } from "zod";

/** Mirrors MembershipBillingConfigurationResponse; an empty configuration is HTTP 204. */
export const membershipBillingConfigurationSchema = z.object({
    id: z.number().int().positive(),
    chargeDefinitionId: z.number().int().positive(),
    enforcementEnabled: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string().nullable(),
});

// Enforcement changes are explicit; omitting the flag preserves existing callers' behavior.
export const updateMembershipBillingConfigurationSchema = z.object({
    chargeDefinitionId: z.number().int().positive("Selecione uma cobrança válida."),
    enforcementEnabled: z.boolean().optional(),
}).strict();

export type MembershipBillingConfiguration = z.infer<typeof membershipBillingConfigurationSchema>;
export type UpdateMembershipBillingConfiguration = z.infer<typeof updateMembershipBillingConfigurationSchema>;
