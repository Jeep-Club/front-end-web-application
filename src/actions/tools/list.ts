'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { listToolsResponseSchema } from "@/schemas/tools/list";
import { extractApiErrorMessage } from "@/utils/http/apiError";

interface Props {
    page?: number;
    size?: number;
}

export async function listToolsAction({ page = 0, size = 10 }: Props = {}) {
    try {
        const response = await actionFetchWrapper<ListToolsResponse>({
            url: `${HttpAPIRoutes.TOOLS}?page=${page}&size=${size}`,
            method: 'GET',
            schema: listToolsResponseSchema,
        });
        return response.data;
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Erro ao carregar ferramentas'), { cause: error });
    }
}