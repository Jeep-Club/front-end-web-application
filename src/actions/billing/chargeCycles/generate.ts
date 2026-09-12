"use server";

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

export async function generateChargeCycleAction(
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
        throw new Error(
            extractApiErrorMessage(error, "Erro ao gerar o ciclo de cobrança"),
            { cause: error },
        );
    }
}
