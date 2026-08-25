'use server';

import { z } from 'zod';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { extractApiErrorMessage } from '@/utils/http/apiError';
import { HttpAPIRoutes } from '@/utils/http/api';
import { getUserProfileAction } from './get';

interface UpdatePersonalDataRequest {
    name: string;
    birthData: string | null;
    email: string;
    rg: string | null;
    phoneNumber: string | null;
}

export async function updatePersonalDataAction(userId: number, data: UpdatePersonalDataRequest): Promise<GetUserProfileResponse> {
    try {
        await actionFetchWrapper({
            url: `${HttpAPIRoutes.ADMIN_USERS}/${userId}`,
            method: 'PUT',
            schema: z.unknown(),
            body: JSON.stringify(data),
        });
        return await getUserProfileAction();
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Erro ao atualizar os dados pessoais'), { cause: error });
    }
}