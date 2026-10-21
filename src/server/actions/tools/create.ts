'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { createToolResponseSchema } from "@/schemas/tools/create";
import { extractApiErrorMessage } from "@/utils/http/apiError";

async function createToolActionImpl(data: CreateToolRequest) {
    try {
        const response = await actionFetchWrapper<CreateToolResponse>({
            url: HttpAPIRoutes.TOOLS,
            method: 'POST',
            schema: createToolResponseSchema,
            body: JSON.stringify(data),
        });
        return response.data;
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Erro ao cadastrar ferramenta'), { cause: error });
    }
}

export async function createToolAction(...args: Parameters<typeof createToolActionImpl>) {
    return captureAction(() => createToolActionImpl(...args));
}
