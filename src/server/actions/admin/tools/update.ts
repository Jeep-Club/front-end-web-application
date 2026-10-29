'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { updateToolResponseSchema } from "@/schemas/tools/update";

export async function updateToolAdminAction(toolId: number, data: UpdateToolRequest) {
    const response = await actionFetchWrapper<UpdateToolResponse>({
        url: `${HttpAPIRoutes.ADMIN_TOOLS}/${toolId}`,
        method: 'PUT',
        schema: updateToolResponseSchema,
        body: JSON.stringify(data),
    });
    return response.data;
}
