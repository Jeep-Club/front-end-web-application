'use server';

import { meProfileResponseSchema } from '@/schemas/user/profile';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { extractApiErrorMessage } from '@/utils/http/apiError';
import { HttpAPIRoutes } from '@/utils/http/api';

export async function getUserProfileAction(): Promise<GetUserProfileResponse> {
    try {
        const response = await actionFetchWrapper({
            url: HttpAPIRoutes.ME,
            method: 'GET',
            schema: meProfileResponseSchema,
        });

        const user = response.data;

        return {
            id: user.userId,
            name: user.userName,
            birthDate: user.birthDate,
            email: user.email,
            cpf: user.cpf,
            rg: user.rg,
            phoneNumber: user.phoneNumber,
            profilePhotoUrl: user.profilePhotoUrl,
            status: user.accountStatus,
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
