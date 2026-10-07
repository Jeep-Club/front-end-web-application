'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { chargeAssignmentResponseSchema } from "@/schemas/billing/chargeAssignment";

export async function activateChargeAssignmentAction(id: number): Promise<ChargeAssignment> {
    try {
        const response = await actionFetchWrapper<ChargeAssignment>({
            url: `${HttpAPIRoutes.BILLING_CHARGE_ASSIGNMENTS}/${id}/activate`,
            method: "PATCH",
            schema: chargeAssignmentResponseSchema,
        });

        return response.data;
    } catch (error) {
        throw new Error(
            extractApiErrorMessage(error, "Erro ao ativar atribuição de cobrança"),
            { cause: error },
        );
    }
}
