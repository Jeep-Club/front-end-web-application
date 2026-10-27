'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { updateToolResponseSchema } from "@/schemas/tools/update";
import { extractAdminToolErrorMessage } from "./error";

async function updateToolAdminActionImpl(toolId: number, data: UpdateToolRequest) {
    try {
        const response = await actionFetchWrapper<UpdateToolResponse>({
            url: `${HttpAPIRoutes.ADMIN_TOOLS}/${toolId}`,
            method: 'PUT',
            schema: updateToolResponseSchema,
            body: JSON.stringify(data),
        });
        return response.data;
    } catch (error) {
        throw new ActionError(extractAdminToolErrorMessage(error, 'Erro ao editar ferramenta'), { cause: error });
    }
}

export async function updateToolAdminAction(...args: Parameters<typeof updateToolAdminActionImpl>) {
    return captureAction(() => updateToolAdminActionImpl(...args));
}
