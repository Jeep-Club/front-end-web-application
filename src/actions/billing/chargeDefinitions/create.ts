'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { chargeDefinitionResponseSchema } from "@/schemas/billing/chargeDefinition";

export async function createChargeDefinitionAction(
    data: ChargeDefinitionRequest,
): Promise<ChargeDefinition> {
    try {
        const response = await actionFetchWrapper<ChargeDefinition>({
            url: HttpAPIRoutes.BILLING_CHARGE_DEFINITIONS,
            method: "POST",
            schema: chargeDefinitionResponseSchema,
            body: JSON.stringify(data),
        });

        return response.data;
    } catch (error) {
        throw new Error(
            extractApiErrorMessage(error, "Erro ao criar definição de cobrança"),
            { cause: error },
        );
    }
}
