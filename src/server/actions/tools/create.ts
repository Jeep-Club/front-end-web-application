'use server';

import { createToolResponseSchema } from "@/schemas/tools/create";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

export async function createToolAction(data: CreateToolRequest) {
    const response = await actionFetchWrapper<CreateToolResponse>({
        url: HttpAPIRoutes.TOOLS,
        method: 'POST',
        schema: createToolResponseSchema,
        body: JSON.stringify(data),
    });
    return response.data;
}
