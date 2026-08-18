'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { createDependentResponseSchema } from "@/schemas/profile/dependent";

export async function createDependentMemberAction(data: CreateDependentRequest) {
    try {
        const response = await actionFetchWrapper<CreateDependentResponse>({
            url: HttpAPIRoutes.DEPENDENTS,
            method: 'POST',
            schema: createDependentResponseSchema,
            body: JSON.stringify(data),
        });

        return response.data;
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Erro ao cadastrar dependente'), { cause: error });
    }
}
