'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { toolDetailResponseSchema } from "@/schemas/tools/detail";

export async function getToolDetailAdminAction(toolId: number) {
    const response = await actionFetchWrapper<ToolDetail>({
        url: `${HttpAPIRoutes.ADMIN_TOOLS}/${toolId}`,
        method: 'GET',
        schema: toolDetailResponseSchema,
    });
    return response.data;
}
