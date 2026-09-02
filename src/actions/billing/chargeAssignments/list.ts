'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { pageResponseSchema } from "@/schemas/page";
import { chargeAssignmentResponseSchema } from "@/schemas/billing/chargeAssignment";

export async function listChargeAssignmentsAction(
    chargeDefinitionId: number,
    searchParams: ChargeAssignmentSearchParams,
): Promise<PageResponse<ChargeAssignment>> {
    const query = new URLSearchParams(
        Object.entries(searchParams).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string",
        ),
    );

    try {
        const response = await actionFetchWrapper({
            url: `${HttpAPIRoutes.BILLING_CHARGE_DEFINITIONS}/${chargeDefinitionId}/assignments?${query.toString()}`,
            method: "GET",
            schema: pageResponseSchema(chargeAssignmentResponseSchema),
        });

        return response.data;
    } catch (error) {
        throw new Error(
            extractApiErrorMessage(error, "Erro ao carregar atribuições de cobrança"),
            { cause: error },
        );
    }
}
