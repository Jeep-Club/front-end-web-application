'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { chargeDefinitionResponseSchema } from "@/schemas/billing/chargeDefinition";

async function updateChargeDefinitionActionImpl(
    id: number,
    data: ChargeDefinitionRequest,
): Promise<ChargeDefinition> {
    try {
        const response = await actionFetchWrapper<ChargeDefinition>({
            url: `${HttpAPIRoutes.BILLING_CHARGE_DEFINITIONS}/${id}`,
            method: "PUT",
            schema: chargeDefinitionResponseSchema,
            body: JSON.stringify(data),
        });

        return response.data;
    } catch (error) {
        throw new ActionError(
            extractApiErrorMessage(error, "Erro ao atualizar definição de cobrança"),
            { cause: error },
        );
    }
}


export async function updateChargeDefinitionAction(...args: Parameters<typeof updateChargeDefinitionActionImpl>) {
    return captureAction(() => updateChargeDefinitionActionImpl(...args));
}
