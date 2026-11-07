'use server';

import { deleteToolResponseSchema } from "@/schemas/tools/delete";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

export async function deleteToolAction(toolId: number) {
    await actionFetchWrapper({
        url: `${HttpAPIRoutes.TOOLS}/${toolId}`,
        method: 'DELETE',
        schema: deleteToolResponseSchema,
    });
}
