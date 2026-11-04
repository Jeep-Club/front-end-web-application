'use server';

import { birthDateSchema } from '@/schemas/auth/user/birthDate';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { HttpAPIRoutes } from '@/utils/http/api';
import { z } from 'zod';

interface UpdatePersonalDataRequest {
    name: string;
    birthDate: string | null;
    email: string;
    rg: string | null;
    phoneNumber: string | null;
}

export async function updatePersonalDataAction(data: UpdatePersonalDataRequest): Promise<void> {
    birthDateSchema.nullable().parse(data.birthDate);
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
}
