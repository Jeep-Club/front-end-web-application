'use server';

import { z } from 'zod';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { extractApiErrorMessage } from '@/utils/http/apiError';
import { HttpAPIRoutes } from '@/utils/http/api';

interface UpdatePersonalDataRequest {
    name: string;
    birthDate: string | null;
    email: string;
    rg: string | null;
    phoneNumber: string | null;
}

export async function updatePersonalDataAction(data: UpdatePersonalDataRequest): Promise<void> {
    try {
        const { email, ...profile } = data;
        await actionFetchWrapper({
            url: HttpAPIRoutes.IDENTITY_ME,
            method: 'PATCH',
            schema: z.unknown(),
            body: JSON.stringify(profile),
        });
        await actionFetchWrapper({
            url: HttpAPIRoutes.IDENTITY_ME_EMAIL,
            method: 'PATCH',
            schema: z.unknown(),
            body: JSON.stringify({ email }),
        });
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Erro ao atualizar os dados pessoais'), { cause: error });
    }
}
