'use server';

import { chargeDefinitionResponseSchema } from "@/schemas/billing/chargeDefinition";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

export async function deactivateChargeDefinitionAction(id: number): Promise<ChargeDefinition> {
    const response = await actionFetchWrapper<ChargeDefinition>({
        url: `${HttpAPIRoutes.BILLING_CHARGE_DEFINITIONS}/${id}/deactivate`,
        method: "PATCH",
        schema: chargeDefinitionResponseSchema,
    });

    return response.data;
}
