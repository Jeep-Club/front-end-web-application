'use server';

import { meAction } from '@/actions/auth/me';
import { backendUserProfileResponseSchema } from '@/schemas/user/profile';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { extractApiErrorMessage } from '@/utils/http/apiError';
import { HttpAPIRoutes } from '@/utils/http/api';

export async function getUserProfileAction(): Promise<GetUserProfileResponse> {
    try {
        const session = await meAction();
        const response = await actionFetchWrapper({
            url: `${HttpAPIRoutes.ADMIN_USERS}/${session.userId}`,
            method: 'GET',
            schema: backendUserProfileResponseSchema,
        });

        const user = response.data;

        return {
            id: user.id,
            name: user.name,
            birthDate: null,
            email: user.email ?? '',
            cpf: user.cpf,
            rg: null,
            phoneNumber: user.phone ?? null,
            profilePhotoUrl: null,
            status: user.passwordChangeRequired
                ? 'CHANGE_PASSWORD_REQUIRED'
                : user.status,
            createdAt: user.createdAt,
            lastLoginAt: null,
        };
    } catch (error) {
        throw new Error(
            extractApiErrorMessage(error, 'Erro ao carregar os dados pessoais'),
            { cause: error },
        );
    }
}
