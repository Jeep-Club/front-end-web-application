'use server';

import { chargeDefinitionResponseSchema } from "@/schemas/billing/chargeDefinition";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

export async function getChargeDefinitionAction(id: number): Promise<ChargeDefinition> {
    const response = await actionFetchWrapper<ChargeDefinition>({
        url: `${HttpAPIRoutes.BILLING_CHARGE_DEFINITIONS}/${id}`,
        method: "GET",
        schema: chargeDefinitionResponseSchema,
    });

    return response.data;
}
