'use server';

import { z } from 'zod';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { HttpAPIRoutes } from '@/utils/http/api';
import { extractApiErrorMessage } from '@/utils/http/apiError';

export async function updateProfilePhotoAction(storageKey: string | null): Promise<void> {
    try {
        await actionFetchWrapper({
            url: `${HttpAPIRoutes.IDENTITY_ME}/photo`,
            method: 'PATCH',
            schema: z.unknown(),
            body: JSON.stringify({ storageKey }),
        });
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Não foi possível atualizar a foto de perfil.'), { cause: error });
    }
}
