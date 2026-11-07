"use server";

import { z } from "zod";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

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
    const response = await actionFetchWrapper({
        url: `${HttpAPIRoutes.BILLING_CHARGE_DEFINITIONS}/${chargeDefinitionId}/cycles`,
        method: "POST",
        body: JSON.stringify(data),
        schema: generateChargeCycleResponseSchema,
    });

    return response.data.createdMemberCharges;
}
