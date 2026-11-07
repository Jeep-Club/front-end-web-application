'use server';

import { adminUserInvitationStatusResponseSchema } from '@/schemas/admin/create-user';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { ActionError } from '@/utils/http/ActionError';
import { HttpAPIRoutes } from '@/utils/http/api';

function invitationUrl(userId: number) {
    return HttpAPIRoutes.ADMIN_USER_ACTIVATION_INVITATIONS.replace('{userId}', String(userId));
}

export async function getUserActivationInvitationAction(userId: number): Promise<AdminUserInvitationStatusResponse | null> {
    try {
        const response = await actionFetchWrapper<AdminUserInvitationStatusResponse>({
            url: invitationUrl(userId),
            method: 'GET',
            cache: 'no-store',
            schema: adminUserInvitationStatusResponseSchema,
        });
        return response.data;
    } catch (error) {
        if (error instanceof ActionError && (error.status === 409 || error.status === 404)) {
            return null;
        }
        throw error;
    }
}

export async function resendUserActivationInvitationAction(userId: number): Promise<AdminUserInvitationStatusResponse> {
    const response = await actionFetchWrapper<AdminUserInvitationStatusResponse>({
        url: invitationUrl(userId),
        method: 'POST',
        cache: 'no-store',
        schema: adminUserInvitationStatusResponseSchema,
    });
    return response.data;
}
