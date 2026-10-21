'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { toolDetailResponseSchema } from "@/schemas/tools/detail";
import { extractApiErrorMessage } from "@/utils/http/apiError";

async function activateToolActionImpl(toolId: number) {
    try {
        const response = await actionFetchWrapper<ToolDetail>({
            url: `${HttpAPIRoutes.TOOLS}/${toolId}/activate`,
            method: 'PATCH',
            schema: toolDetailResponseSchema,
        });
        return response.data;
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Erro ao ativar ferramenta'), { cause: error });
    }
}

export async function activateToolAction(...args: Parameters<typeof activateToolActionImpl>) {
    return captureAction(() => activateToolActionImpl(...args));
}
