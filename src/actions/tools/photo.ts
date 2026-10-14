'use server';

import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { toolDetailResponseSchema } from '@/schemas/tools/detail';
import { HttpAPIRoutes } from '@/utils/http/api';
import { extractApiErrorMessage } from '@/utils/http/apiError';

export async function updateToolPhotoAction(id: number, storageKey: string | null): Promise<ToolDetail> {
    try {
        return (await actionFetchWrapper<ToolDetail>({
            url: `${HttpAPIRoutes.TOOLS}/${id}/photo`, method: 'PATCH',
            body: JSON.stringify({ storageKey }), schema: toolDetailResponseSchema,
        })).data;
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Não foi possível salvar a foto da ferramenta.'), { cause: error });
    }
}
