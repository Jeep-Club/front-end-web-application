'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import { z } from 'zod';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { HttpAPIRoutes } from '@/utils/http/api';
import { extractApiErrorMessage } from '@/utils/http/apiError';

async function updateProfilePhotoActionImpl(storageKey: string | null): Promise<void> {
    try {
        await actionFetchWrapper({
            url: `${HttpAPIRoutes.IDENTITY_ME}/photo`,
            method: 'PATCH',
            schema: z.unknown(),
            body: JSON.stringify({ storageKey }),
        });
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Não foi possível atualizar a foto de perfil.'), { cause: error });
    }
}


export async function updateProfilePhotoAction(...args: Parameters<typeof updateProfilePhotoActionImpl>) {
    return captureAction(() => updateProfilePhotoActionImpl(...args));
}
