'use server';

import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { HttpAPIRoutes } from '@/utils/http/api';
import { z } from 'zod';

export async function updateProfilePhotoAction(storageKey: string | null): Promise<void> {
    await actionFetchWrapper({
        url: `${HttpAPIRoutes.IDENTITY_ME}/photo`,
        method: 'PATCH',
        schema: z.unknown(),
        body: JSON.stringify({ storageKey }),
    });
}
