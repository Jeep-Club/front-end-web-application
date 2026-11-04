'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { createToolResponseSchema } from "@/schemas/tools/create";

export async function createToolAdminAction(userId: number, data: CreateToolRequest) {
    const response = await actionFetchWrapper<CreateToolResponse>({
        url: `${HttpAPIRoutes.ADMIN_TOOLS}/users/${userId}`,
        method: 'POST',
        schema: createToolResponseSchema,
        body: JSON.stringify(data),
    });
    return response.data;
}
