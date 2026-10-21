'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { chargeAssignmentResponseSchema } from "@/schemas/billing/chargeAssignment";

async function activateChargeAssignmentActionImpl(id: number): Promise<ChargeAssignment> {
    try {
        const response = await actionFetchWrapper<ChargeAssignment>({
            url: `${HttpAPIRoutes.BILLING_CHARGE_ASSIGNMENTS}/${id}/activate`,
            method: "PATCH",
            schema: chargeAssignmentResponseSchema,
        });

        return response.data;
    } catch (error) {
        throw new ActionError(
            extractApiErrorMessage(error, "Erro ao ativar atribuição de cobrança"),
            { cause: error },
        );
    }
}


export async function activateChargeAssignmentAction(...args: Parameters<typeof activateChargeAssignmentActionImpl>) {
    return captureAction(() => activateChargeAssignmentActionImpl(...args));
}
