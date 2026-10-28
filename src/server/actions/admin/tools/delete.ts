'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { deleteToolResponseSchema } from "@/schemas/tools/delete";
import { extractAdminToolErrorMessage } from "./error";

async function deleteToolAdminActionImpl(toolId: number) {
    try {
        await actionFetchWrapper({
            url: `${HttpAPIRoutes.ADMIN_TOOLS}/${toolId}`,
            method: 'DELETE',
            schema: deleteToolResponseSchema,
        });
    } catch (error) {
        throw new ActionError(extractAdminToolErrorMessage(error, 'Erro ao excluir ferramenta'), { cause: error });
    }
}

export async function deleteToolAdminAction(...args: Parameters<typeof deleteToolAdminActionImpl>) {
    return captureAction(() => deleteToolAdminActionImpl(...args));
}
