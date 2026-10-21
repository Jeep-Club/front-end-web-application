'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

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

async function updatePersonalDataActionImpl(data: UpdatePersonalDataRequest): Promise<void> {
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
        throw new ActionError(extractApiErrorMessage(error, 'Erro ao atualizar os dados pessoais'), { cause: error });
    }
}


export async function updatePersonalDataAction(...args: Parameters<typeof updatePersonalDataActionImpl>) {
    return captureAction(() => updatePersonalDataActionImpl(...args));
}
