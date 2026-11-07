'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { toolDetailResponseSchema } from "@/schemas/tools/detail";
import { HttpAPIRoutes } from "@/utils/http/api";

export async function updateToolPhotoAdminAction(id: number, storageKey: string | null): Promise<ToolDetail> {
    return (await actionFetchWrapper<ToolDetail>({
        url: `${HttpAPIRoutes.ADMIN_TOOLS}/${id}/photo`,
        method: 'PATCH',
        body: JSON.stringify({ storageKey }),
        schema: toolDetailResponseSchema,
    })).data;

}
