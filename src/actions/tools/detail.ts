'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { toolDetailResponseSchema } from "@/schemas/tools/detail";
import { extractApiErrorMessage } from "@/utils/http/apiError";

export async function getToolDetailAction(toolId: number) {
    try {
        const response = await actionFetchWrapper<ToolDetail>({
            url: `${HttpAPIRoutes.TOOLS}/${toolId}`,
            method: 'GET',
            schema: toolDetailResponseSchema,
        });
        return response.data;
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Erro ao carregar dados da ferramenta'), { cause: error });
    }
}