'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { toolDetailResponseSchema } from "@/schemas/tools/detail";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractAdminToolErrorMessage } from "./error";

async function updateToolPhotoAdminActionImpl(id: number, storageKey: string | null): Promise<ToolDetail> {
    try {
        return (await actionFetchWrapper<ToolDetail>({
            url: `${HttpAPIRoutes.ADMIN_TOOLS}/${id}/photo`,
            method: 'PATCH',
            body: JSON.stringify({ storageKey }),
            schema: toolDetailResponseSchema,
        })).data;
    } catch (error) {
        throw new ActionError(extractAdminToolErrorMessage(error, 'Não foi possível salvar a foto da ferramenta.'), { cause: error });
    }
}

export async function updateToolPhotoAdminAction(...args: Parameters<typeof updateToolPhotoAdminActionImpl>) {
    return captureAction(() => updateToolPhotoAdminActionImpl(...args));
}
