'use server';

import { toolDetailResponseSchema } from '@/schemas/tools/detail';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { HttpAPIRoutes } from '@/utils/http/api';

export async function updateToolPhotoAction(id: number, storageKey: string | null): Promise<ToolDetail> {
    return (await actionFetchWrapper<ToolDetail>({
        url: `${HttpAPIRoutes.TOOLS}/${id}/photo`, method: 'PATCH',
        body: JSON.stringify({ storageKey }), schema: toolDetailResponseSchema,
    })).data;
}
