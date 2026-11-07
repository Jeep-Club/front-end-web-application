'use server';

import { chargeDefinitionSummaryResponseSchema } from "@/schemas/billing/chargeDefinition";
import { pageResponseSchema } from "@/schemas/page";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

export async function listChargeDefinitionsAction(
    searchParams: ChargeDefinitionSearchParams,
): Promise<PageResponse<ChargeDefinitionSummary>> {
    const query = new URLSearchParams(
        Object.entries(searchParams).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string",
        ),
    );

    const response = await actionFetchWrapper({
        url: `${HttpAPIRoutes.BILLING_CHARGE_DEFINITIONS}?${query.toString()}`,
        method: "GET",
        schema: pageResponseSchema(chargeDefinitionSummaryResponseSchema),
    });

    return response.data;
}
