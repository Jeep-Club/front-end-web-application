'use server';

import { chargeDefinitionResponseSchema } from "@/schemas/billing/chargeDefinition";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

export async function createChargeDefinitionAction(
    data: ChargeDefinitionRequest,
): Promise<ChargeDefinition> {
    const response = await actionFetchWrapper<ChargeDefinition>({
        url: HttpAPIRoutes.BILLING_CHARGE_DEFINITIONS,
        method: "POST",
        schema: chargeDefinitionResponseSchema,
        body: JSON.stringify(data),
    });

    return response.data;
}
