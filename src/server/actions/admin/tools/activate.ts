'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { toolDetailResponseSchema } from "@/schemas/tools/detail";

export async function activateToolAdminAction(toolId: number) {
    const response = await actionFetchWrapper<ToolDetail>({
        url: `${HttpAPIRoutes.ADMIN_TOOLS}/${toolId}/activate`,
        method: 'PATCH',
        schema: toolDetailResponseSchema,
    });
    return response.data;
}
