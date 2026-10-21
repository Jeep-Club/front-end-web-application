'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { listToolsResponseSchema } from "@/schemas/tools/list";
import { extractApiErrorMessage } from "@/utils/http/apiError";

interface Props {
    page?: number;
    size?: number;
}

async function listToolsActionImpl({ page = 0, size = 10 }: Props = {}) {
    size = Math.min(Math.max(size, 1), 50);
    try {
        const response = await actionFetchWrapper<ListToolsResponse>({
            url: `${HttpAPIRoutes.TOOLS}?page=${page}&size=${size}`,
            method: 'GET',
            schema: listToolsResponseSchema,
        });
        return response.data;
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Erro ao carregar ferramentas'), { cause: error });
    }
}


export async function listToolsAction(...args: Parameters<typeof listToolsActionImpl>) {
    return captureAction(() => listToolsActionImpl(...args));
}
