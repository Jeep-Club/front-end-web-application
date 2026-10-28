'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { toolDetailResponseSchema } from "@/schemas/tools/detail";
import { extractAdminToolErrorMessage } from "./error";

async function deactivateToolAdminActionImpl(toolId: number) {
    try {
        const response = await actionFetchWrapper<ToolDetail>({
            url: `${HttpAPIRoutes.ADMIN_TOOLS}/${toolId}/deactivate`,
            method: 'PATCH',
            schema: toolDetailResponseSchema,
        });
        return response.data;
    } catch (error) {
        throw new ActionError(extractAdminToolErrorMessage(error, 'Erro ao desativar ferramenta'), { cause: error });
    }
}

export async function deactivateToolAdminAction(...args: Parameters<typeof deactivateToolAdminActionImpl>) {
    return captureAction(() => deactivateToolAdminActionImpl(...args));
}
