'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { chargeDefinitionResponseSchema } from "@/schemas/billing/chargeDefinition";

async function archiveChargeDefinitionActionImpl(id: number): Promise<ChargeDefinition> {
    try {
        const response = await actionFetchWrapper<ChargeDefinition>({
            url: `${HttpAPIRoutes.BILLING_CHARGE_DEFINITIONS}/${id}/archive`,
            method: "PATCH",
            schema: chargeDefinitionResponseSchema,
        });

        return response.data;
    } catch (error) {
        throw new ActionError(
            extractApiErrorMessage(error, "Erro ao arquivar definição de cobrança"),
            { cause: error },
        );
    }
}


export async function archiveChargeDefinitionAction(...args: Parameters<typeof archiveChargeDefinitionActionImpl>) {
    return captureAction(() => archiveChargeDefinitionActionImpl(...args));
}
