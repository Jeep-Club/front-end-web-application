'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { pageResponseSchema } from "@/schemas/page";
import { chargeDefinitionSummaryResponseSchema } from "@/schemas/billing/chargeDefinition";

async function listChargeDefinitionsActionImpl(
    searchParams: ChargeDefinitionSearchParams,
): Promise<PageResponse<ChargeDefinitionSummary>> {
    const query = new URLSearchParams(
        Object.entries(searchParams).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string",
        ),
    );

    try {
        const response = await actionFetchWrapper({
            url: `${HttpAPIRoutes.BILLING_CHARGE_DEFINITIONS}?${query.toString()}`,
            method: "GET",
            schema: pageResponseSchema(chargeDefinitionSummaryResponseSchema),
        });

        return response.data;
    } catch (error) {
        throw new ActionError(
            extractApiErrorMessage(error, "Erro ao carregar definições de cobrança"),
            { cause: error },
        );
    }
}


export async function listChargeDefinitionsAction(...args: Parameters<typeof listChargeDefinitionsActionImpl>) {
    return captureAction(() => listChargeDefinitionsActionImpl(...args));
}
