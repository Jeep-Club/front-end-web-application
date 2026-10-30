'use server';

import { updateToolResponseSchema } from "@/schemas/tools/update";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

export async function updateToolAction(toolId: number, data: UpdateToolRequest) {
    const response = await actionFetchWrapper<UpdateToolResponse>({
        url: `${HttpAPIRoutes.TOOLS}/${toolId}`,
        method: 'PUT',
        schema: updateToolResponseSchema,
        body: JSON.stringify(data),
    });
    return response.data;
}
