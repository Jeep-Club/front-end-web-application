'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { updateToolResponseSchema } from "@/schemas/tools/update";
import { extractApiErrorMessage } from "@/utils/http/apiError";

export async function updateAdminToolAction(toolId: number, data: UpdateToolRequest) {
    try {
        const response = await actionFetchWrapper<UpdateToolResponse>({
            url: `${HttpAPIRoutes.TOOLS}/admin/${toolId}`,
            method: 'PUT',
            schema: updateToolResponseSchema,
            body: JSON.stringify(data),
        });
        return response.data;
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Erro ao editar ferramenta'), { cause: error });
    }
}