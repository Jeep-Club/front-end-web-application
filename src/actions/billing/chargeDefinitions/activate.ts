'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { chargeDefinitionResponseSchema } from "@/schemas/billing/chargeDefinition";

export async function activateChargeDefinitionAction(id: number): Promise<ChargeDefinition> {
    try {
        const response = await actionFetchWrapper<ChargeDefinition>({
            url: `${HttpAPIRoutes.BILLING_CHARGE_DEFINITIONS}/${id}/activate`,
            method: "PATCH",
            schema: chargeDefinitionResponseSchema,
        });

        return response.data;
    } catch (error) {
        throw new Error(
            extractApiErrorMessage(error, "Erro ao ativar definição de cobrança"),
            { cause: error },
        );
    }
}
