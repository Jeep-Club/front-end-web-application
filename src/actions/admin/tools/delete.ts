'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { deleteToolResponseSchema } from "@/schemas/tools/delete";
import { extractApiErrorMessage } from "@/utils/http/apiError";

export async function deleteAdminToolAction(toolId: number) {
    try {
        await actionFetchWrapper({
            url: `${HttpAPIRoutes.TOOLS}/admin/${toolId}`,
            method: 'DELETE',
            schema: deleteToolResponseSchema,
        });
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Erro ao excluir ferramenta'), { cause: error });
    }
}