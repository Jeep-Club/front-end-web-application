'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { toolDetailResponseSchema } from "@/schemas/tools/detail";
import { extractAdminToolErrorMessage } from "./error";

async function activateToolAdminActionImpl(toolId: number) {
    try {
        const response = await actionFetchWrapper<ToolDetail>({
            url: `${HttpAPIRoutes.ADMIN_TOOLS}/${toolId}/activate`,
            method: 'PATCH',
            schema: toolDetailResponseSchema,
        });
        return response.data;
    } catch (error) {
        throw new ActionError(extractAdminToolErrorMessage(error, 'Erro ao ativar ferramenta'), { cause: error });
    }
}

export async function activateToolAdminAction(...args: Parameters<typeof activateToolAdminActionImpl>) {
    return captureAction(() => activateToolAdminActionImpl(...args));
}
