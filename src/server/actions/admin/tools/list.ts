'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { listAdminToolsResponseSchema } from "@/schemas/admin/tools";
import { getToolDetailAdminAction } from "@/actions/admin/tools/detail";
import { extractAdminToolErrorMessage } from "./error";

async function listToolsAdminActionImpl({
    page = 0,
    size = 10,
    name,
    status,
}: ListAdminToolsParams = {}) {
    size = Math.min(Math.max(size, 1), 50);

    const searchParams = new URLSearchParams();
    searchParams.set("page", String(Math.max(0, page)));
    searchParams.set("size", String(size));

    const trimmedName = name?.trim();
    if (trimmedName) {
        searchParams.set("name", trimmedName);
    }

    if (status) {
        searchParams.set("status", status);
    }

    try {
        const response = await actionFetchWrapper<ListAdminToolsResponse>({
            url: `${HttpAPIRoutes.ADMIN_TOOLS}?${searchParams.toString()}`,
            method: 'GET',
            schema: listAdminToolsResponseSchema,
        });

        const content = [...response.data.content];
        const missing = content
            .map((tool, index) => ({ tool, index }))
            .filter(({ tool }) => tool.photoStorageKey === undefined);

        for (let start = 0; start < missing.length; start += 5) {
            const batch = missing.slice(start, start + 5);
            const details = await Promise.allSettled(
                batch.map(({ tool }) => getToolDetailAdminAction(tool.id)),
            );
            details.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    const target = batch[index];
                    content[target.index] = {
                        ...target.tool,
                        photoStorageKey: result.value.photoStorageKey ?? null,
                    };
                }
            });
        }

        return { ...response.data, content };
    } catch (error) {
        throw new ActionError(extractAdminToolErrorMessage(error, 'Erro ao carregar ferramentas'), { cause: error });
    }
}

export async function listToolsAdminAction(...args: Parameters<typeof listToolsAdminActionImpl>) {
    return captureAction(() => listToolsAdminActionImpl(...args));
}
