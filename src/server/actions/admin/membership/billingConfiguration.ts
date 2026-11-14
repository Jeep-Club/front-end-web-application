"use server";

import {
    membershipBillingConfigurationSchema,
    updateMembershipBillingConfigurationSchema,
    type MembershipBillingConfiguration,
    type UpdateMembershipBillingConfiguration,
} from "@/schemas/membership/billingConfiguration";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { ActionError } from "@/utils/http/ActionError";
import { haveActionPermission } from "@/utils/permission/actionPermissions";
import { z } from "zod";

export async function getMembershipBillingConfigurationAction(): Promise<MembershipBillingConfiguration | null> {
    if (!await haveActionPermission("MEMBERSHIP", "BILLING_CONFIGURATION_READ")) {
        throw new ActionError("Você não tem permissão para consultar a regularidade dos associados.", { status: 403 });
    }
    const response = await actionFetchWrapper({
        url: HttpAPIRoutes.ADMIN_MEMBERSHIP_BILLING_CONFIGURATION,
        method: "GET",
        cache: "no-store",
        schema: membershipBillingConfigurationSchema,
    });
    return response.status === 204 ? null : response.data;
}

export async function updateMembershipBillingConfigurationAction(input: UpdateMembershipBillingConfiguration): Promise<MembershipBillingConfiguration> {
    if (!await haveActionPermission("MEMBERSHIP", "BILLING_CONFIGURATION_UPDATE")) {
        throw new ActionError("Você não tem permissão para configurar a regularidade dos associados.", { status: 403 });
    }
    const parsed = updateMembershipBillingConfigurationSchema.safeParse(input);
    if (!parsed.success) throw new ActionError("Selecione uma cobrança válida.", { status: 400 });

    // Legacy callers preserve the current flag; the configuration form explicitly submits it.
    const current = await getMembershipBillingConfigurationAction();
    const response = await actionFetchWrapper({
        url: HttpAPIRoutes.ADMIN_MEMBERSHIP_BILLING_CONFIGURATION,
        method: "PUT",
        cache: "no-store",
        body: JSON.stringify({ chargeDefinitionId: parsed.data.chargeDefinitionId, enforcementEnabled: parsed.data.enforcementEnabled ?? current?.enforcementEnabled ?? false }),
        schema: membershipBillingConfigurationSchema,
    });
    return response.data;
}

/** Toggle enforcement without replacing or revalidating the configured charge definition. */
export async function updateMembershipBillingEnforcementAction(enforcementEnabled: boolean): Promise<MembershipBillingConfiguration> {
    if (!await haveActionPermission("MEMBERSHIP", "BILLING_CONFIGURATION_UPDATE")) {
        throw new ActionError("Você não tem permissão para configurar a regularidade dos associados.", { status: 403 });
    }
    const parsed = z.boolean().safeParse(enforcementEnabled);
    if (!parsed.success) throw new ActionError("Informe se o bloqueio deve ser ativado.", { status: 400 });
    const response = await actionFetchWrapper({
        url: `${HttpAPIRoutes.ADMIN_MEMBERSHIP_BILLING_CONFIGURATION}/enforcement`,
        method: "PATCH", cache: "no-store",
        body: JSON.stringify({ enforcementEnabled: parsed.data }),
        schema: membershipBillingConfigurationSchema,
    });
    return response.data;
}
