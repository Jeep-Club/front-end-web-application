"use server";

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import { z } from "zod";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";

interface GenerateChargeCycleRequest {
    code: string;
    dueDate: string;
}

const generateChargeCycleResponseSchema = z.object({
    createdMemberCharges: z.number(),
});

async function generateChargeCycleActionImpl(
    chargeDefinitionId: number,
    data: GenerateChargeCycleRequest,
): Promise<number> {
    try {
        const response = await actionFetchWrapper({
            url: `${HttpAPIRoutes.BILLING_CHARGE_DEFINITIONS}/${chargeDefinitionId}/cycles`,
            method: "POST",
            body: JSON.stringify(data),
            schema: generateChargeCycleResponseSchema,
        });

        return response.data.createdMemberCharges;
    } catch (error) {
        throw new ActionError(
            extractApiErrorMessage(error, "Erro ao gerar o ciclo de cobrança"),
            { cause: error },
        );
    }
}


export async function generateChargeCycleAction(...args: Parameters<typeof generateChargeCycleActionImpl>) {
    return captureAction(() => generateChargeCycleActionImpl(...args));
}
