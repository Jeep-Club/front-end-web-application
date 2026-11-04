'use server';

import { chargeAssignmentResponseSchema } from "@/schemas/billing/chargeAssignment";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

export async function deactivateChargeAssignmentAction(id: number): Promise<ChargeAssignment> {
    const response = await actionFetchWrapper<ChargeAssignment>({
        url: `${HttpAPIRoutes.BILLING_CHARGE_ASSIGNMENTS}/${id}/deactivate`,
        method: "PATCH",
        schema: chargeAssignmentResponseSchema,
    });

    return response.data;
}
