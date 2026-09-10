'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { listAdminToolsResponseSchema } from "@/schemas/admin/tools";
import { extractApiErrorMessage } from "@/utils/http/apiError";

export async function listAdminToolsAction({ name, status, page = 0, size = 12 }: AdminToolFilters = {}) {
    try {
        const params = new URLSearchParams({ page: String(page), size: String(size) });
        if (name?.trim()) params.set("name", name.trim());
        if (status) params.set("status", status);

        const response = await actionFetchWrapper<ListAdminToolsResponse>({
            url: `${HttpAPIRoutes.ADMIN_TOOLS}?${params.toString()}`,
            method: 'GET',
            schema: listAdminToolsResponseSchema,
            cache: 'no-store',
        });
        return response.data;
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Erro ao carregar ferramentas'), { cause: error });
    }
}
