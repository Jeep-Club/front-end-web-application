'use server';

import { meProfileResponseSchema } from '@/schemas/user/profile';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { cacheProfilePhotoStorageKey } from '@/utils/auth/me';
import { HttpAPIRoutes } from '@/utils/http/api';

export async function getUserProfileAction(): Promise<GetUserProfileResponse> {
    const response = await actionFetchWrapper({
        url: HttpAPIRoutes.IDENTITY_ME,
        method: 'GET',
        schema: meProfileResponseSchema,
    });

    const user = response.data;
    await cacheProfilePhotoStorageKey(user.profilePhotoStorageKey);

    return {
        id: user.id,
        name: user.name,
        birthDate: user.birthDate,
        email: user.email ?? '',
        cpf: user.cpf,
        rg: user.rg,
        phoneNumber: user.phoneNumber,
        profilePhotoUrl: user.profilePhotoUrl,
        status: user.status,
        createdAt: user.createdAt,
        lastLoginAt: null,
    };
}
