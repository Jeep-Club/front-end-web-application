'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { createToolResponseSchema } from "@/schemas/tools/create";
import { extractAdminToolErrorMessage } from "./error";

async function createToolAdminActionImpl(userId: number, data: CreateToolRequest) {
    try {
        const response = await actionFetchWrapper<CreateToolResponse>({
            url: `${HttpAPIRoutes.ADMIN_TOOLS}/users/${userId}`,
            method: 'POST',
            schema: createToolResponseSchema,
            body: JSON.stringify(data),
        });
        return response.data;
    } catch (error) {
        throw new ActionError(extractAdminToolErrorMessage(error, 'Erro ao cadastrar ferramenta'), { cause: error });
    }
}

export async function createToolAdminAction(...args: Parameters<typeof createToolAdminActionImpl>) {
    return captureAction(() => createToolAdminActionImpl(...args));
}
