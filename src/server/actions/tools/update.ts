'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { updateToolResponseSchema } from "@/schemas/tools/update";
import { extractApiErrorMessage } from "@/utils/http/apiError";

async function updateToolActionImpl(toolId: number, data: UpdateToolRequest) {
    try {
        const response = await actionFetchWrapper<UpdateToolResponse>({
            url: `${HttpAPIRoutes.TOOLS}/${toolId}`,
            method: 'PUT',
            schema: updateToolResponseSchema,
            body: JSON.stringify(data),
        });
        return response.data;
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Erro ao editar ferramenta'), { cause: error });
    }
}

export async function updateToolAction(...args: Parameters<typeof updateToolActionImpl>) {
    return captureAction(() => updateToolActionImpl(...args));
}
