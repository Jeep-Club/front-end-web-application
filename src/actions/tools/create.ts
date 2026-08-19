'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { createToolResponseSchema } from "@/schemas/tools/create";
import { extractApiErrorMessage } from "@/utils/http/apiError";

export async function createToolAction(data: CreateToolRequest) {
    try {
        const response = await actionFetchWrapper<CreateToolResponse>({
            url: HttpAPIRoutes.TOOLS,
            method: 'POST',
            schema: createToolResponseSchema,
            body: JSON.stringify(data),
        });
        return response.data;
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Erro ao cadastrar ferramenta'), { cause: error });
    }
}