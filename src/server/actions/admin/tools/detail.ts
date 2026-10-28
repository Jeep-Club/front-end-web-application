'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { toolDetailResponseSchema } from "@/schemas/tools/detail";
import { extractAdminToolErrorMessage } from "./error";

async function getToolDetailAdminActionImpl(toolId: number) {
    try {
        const response = await actionFetchWrapper<ToolDetail>({
            url: `${HttpAPIRoutes.ADMIN_TOOLS}/${toolId}`,
            method: 'GET',
            schema: toolDetailResponseSchema,
        });
        return response.data;
    } catch (error) {
        throw new ActionError(extractAdminToolErrorMessage(error, 'Erro ao carregar dados da ferramenta'), { cause: error });
    }
}

export async function getToolDetailAdminAction(...args: Parameters<typeof getToolDetailAdminActionImpl>) {
    return captureAction(() => getToolDetailAdminActionImpl(...args));
}
