'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { toolDetailResponseSchema } from "@/schemas/tools/detail";
import { extractApiErrorMessage } from "@/utils/http/apiError";

async function getToolDetailActionImpl(toolId: number) {
    try {
        const response = await actionFetchWrapper<ToolDetail>({
            url: `${HttpAPIRoutes.TOOLS}/${toolId}`,
            method: 'GET',
            schema: toolDetailResponseSchema,
        });
        return response.data;
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Erro ao carregar dados da ferramenta'), { cause: error });
    }
}

export async function getToolDetailAction(...args: Parameters<typeof getToolDetailActionImpl>) {
    return captureAction(() => getToolDetailActionImpl(...args));
}
