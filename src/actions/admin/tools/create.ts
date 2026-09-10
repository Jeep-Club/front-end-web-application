'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { toolDetailResponseSchema } from "@/schemas/tools/detail";
import { extractApiErrorMessage } from "@/utils/http/apiError";

export async function createAdminToolAction(userId: number, data: CreateToolRequest) {
    try {
        const response = await actionFetchWrapper<ToolDetail>({
            url: `${HttpAPIRoutes.ADMIN_TOOLS}/users/${userId}`,
            method: 'POST',
            schema: toolDetailResponseSchema,
            body: JSON.stringify(data),
        });
        return response.data;
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Erro ao cadastrar ferramenta'), { cause: error });
    }
}
