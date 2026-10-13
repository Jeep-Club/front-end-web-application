'use server';

import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { adminUserInvitationStatusResponseSchema } from '@/schemas/admin/create-user';
import { HttpAPIRoutes } from '@/utils/http/api';
import { extractApiErrorMessage } from '@/utils/http/apiError';

function invitationUrl(userId: number) {
    return HttpAPIRoutes.ADMIN_USER_ACTIVATION_INVITATIONS.replace('{userId}', String(userId));
}

export async function getUserActivationInvitationAction(userId: number): Promise<AdminUserInvitationStatusResponse> {
    try {
        const response = await actionFetchWrapper<AdminUserInvitationStatusResponse>({
            url: invitationUrl(userId), method: 'GET', schema: adminUserInvitationStatusResponseSchema,
        });
        return response.data;
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Não foi possível consultar o convite.'), { cause: error });
    }
}

export async function resendUserActivationInvitationAction(userId: number): Promise<AdminUserInvitationStatusResponse> {
    try {
        const response = await actionFetchWrapper<AdminUserInvitationStatusResponse>({
            url: invitationUrl(userId), method: 'POST', schema: adminUserInvitationStatusResponseSchema,
        });
        return response.data;
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Não foi possível reenviar o convite.'), { cause: error });
    }
}
