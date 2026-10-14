'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { listToolsResponseSchema } from "@/schemas/tools/list";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { getToolDetailAction } from './detail';

interface Props {
    page?: number;
    size?: number;
}

export async function listToolsAction({ page = 0, size = 10 }: Props = {}) {
    size = Math.min(Math.max(size, 1), 50);
    try {
        const response = await actionFetchWrapper<ListToolsResponse>({
            url: `${HttpAPIRoutes.TOOLS}?page=${page}&size=${size}`,
            method: 'GET',
            schema: listToolsResponseSchema,
        });
        // Older deployments omit photoStorageKey in summaries even though
        // tool details already expose it. Limit concurrent compatibility reads.
        const content = [...response.data.content];
        const missing = content.map((tool, index) => ({ tool, index }))
            .filter(({ tool }) => tool.photoStorageKey === undefined);
        for (let start = 0; start < missing.length; start += 5) {
            const batch = missing.slice(start, start + 5);
            const details = await Promise.allSettled(batch.map(({ tool }) => getToolDetailAction(tool.id)));
            details.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    const target = batch[index];
                    content[target.index] = { ...target.tool, photoStorageKey: result.value.photoStorageKey ?? null };
                }
            });
        }
        return { ...response.data, content };
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Erro ao carregar ferramentas'), { cause: error });
    }
}
