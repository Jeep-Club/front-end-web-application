'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { listAdminToolsResponseSchema } from "@/schemas/admin/tools";
import { extractApiErrorMessage } from "@/utils/http/apiError";

export async function listAdminToolsAction({ name, status, page = 0, size = 12 }: AdminToolFilters = {}) {
    try {
        const params = new URLSearchParams({ page: String(page), size: String(size) });
        if (name) params.set("name", name);
        if (status) params.set("status", status);

        const response = await actionFetchWrapper<ListAdminToolsResponse>({
            url: `${HttpAPIRoutes.TOOLS}/admin?${params.toString()}`,
            method: 'GET',
            schema: listAdminToolsResponseSchema,
        });
        return response.data;
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Erro ao carregar ferramentas'), { cause: error });
    }
}