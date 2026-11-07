'use server';

import { chargeAssignmentResponseSchema } from "@/schemas/billing/chargeAssignment";
import { pageResponseSchema } from "@/schemas/page";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

export async function listChargeAssignmentsAction(
    chargeDefinitionId: number,
    searchParams: ChargeAssignmentSearchParams,
): Promise<PageResponse<ChargeAssignment>> {
    const query = new URLSearchParams(
        Object.entries(searchParams).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string",
        ),
    );

    const response = await actionFetchWrapper({
        url: `${HttpAPIRoutes.BILLING_CHARGE_DEFINITIONS}/${chargeDefinitionId}/assignments?${query.toString()}`,
        method: "GET",
        schema: pageResponseSchema(chargeAssignmentResponseSchema),
    });

    return response.data;
}
