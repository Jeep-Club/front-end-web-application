'use server';

import { adminUserInvitationStatusResponseSchema } from '@/schemas/admin/create-user';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { HttpAPIRoutes } from '@/utils/http/api';
import { z } from 'zod';

function invitationUrl(userId: number) {
    return HttpAPIRoutes.ADMIN_USER_ACTIVATION_INVITATIONS.replace('{userId}', String(userId));
}

export async function getUserActivationInvitationAction(userId: number): Promise<AdminUserInvitationStatusResponse> {
    const response = await actionFetchWrapper<AdminUserInvitationStatusResponse>({
        url: invitationUrl(userId), method: 'GET', schema: adminUserInvitationStatusResponseSchema,
    });
    return response.data;
}

export async function resendUserActivationInvitationAction(userId: number): Promise<AdminUserInvitationStatusResponse> {
    const response = await actionFetchWrapper<AdminUserInvitationStatusResponse>({
        url: invitationUrl(userId), method: 'POST', schema: adminUserInvitationStatusResponseSchema,
    });
    return response.data;
}

export async function revokeUserActivationInvitationAction(userId: number): Promise<void> {
    await actionFetchWrapper<unknown>({
        url: invitationUrl(userId), method: 'DELETE', schema: z.unknown(),
    });
}
