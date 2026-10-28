'use server';

import { toolDetailResponseSchema } from "@/schemas/tools/detail";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

export async function getToolDetailAction(toolId: number) {
    const response = await actionFetchWrapper<ToolDetail>({
        url: `${HttpAPIRoutes.TOOLS}/${toolId}`,
        method: 'GET',
        schema: toolDetailResponseSchema,
    });
    return response.data;
}
