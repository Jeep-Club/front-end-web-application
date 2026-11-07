'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { deleteToolResponseSchema } from "@/schemas/tools/delete";

export async function deleteToolAdminAction(toolId: number) {
    await actionFetchWrapper({
        url: `${HttpAPIRoutes.ADMIN_TOOLS}/${toolId}`,
        method: 'DELETE',
        schema: deleteToolResponseSchema,
    });

}
