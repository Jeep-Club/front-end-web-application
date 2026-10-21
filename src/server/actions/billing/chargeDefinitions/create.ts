'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { chargeDefinitionResponseSchema } from "@/schemas/billing/chargeDefinition";

async function createChargeDefinitionActionImpl(
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
        throw new ActionError(
            extractApiErrorMessage(error, "Erro ao criar definição de cobrança"),
            { cause: error },
        );
    }
}


export async function createChargeDefinitionAction(...args: Parameters<typeof createChargeDefinitionActionImpl>) {
    return captureAction(() => createChargeDefinitionActionImpl(...args));
}
