'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { deleteToolResponseSchema } from "@/schemas/tools/delete";
import { extractApiErrorMessage } from "@/utils/http/apiError";

async function deleteToolActionImpl(toolId: number) {
    try {
        await actionFetchWrapper({
            url: `${HttpAPIRoutes.TOOLS}/${toolId}`,
            method: 'DELETE',
            schema: deleteToolResponseSchema,
        });
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Erro ao excluir ferramenta'), { cause: error });
    }
}

export async function deleteToolAction(...args: Parameters<typeof deleteToolActionImpl>) {
    return captureAction(() => deleteToolActionImpl(...args));
}
