'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { adminUserInvitationStatusResponseSchema } from '@/schemas/admin/create-user';
import { HttpAPIRoutes } from '@/utils/http/api';
import { extractApiErrorMessage } from '@/utils/http/apiError';
import { z } from 'zod';

function invitationUrl(userId: number) {
    return HttpAPIRoutes.ADMIN_USER_ACTIVATION_INVITATIONS.replace('{userId}', String(userId));
}

async function getUserActivationInvitationActionImpl(userId: number): Promise<AdminUserInvitationStatusResponse> {
    try {
        const response = await actionFetchWrapper<AdminUserInvitationStatusResponse>({
            url: invitationUrl(userId), method: 'GET', schema: adminUserInvitationStatusResponseSchema,
        });
        return response.data;
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Não foi possível consultar o convite.'), { cause: error });
    }
}

async function resendUserActivationInvitationActionImpl(userId: number): Promise<AdminUserInvitationStatusResponse> {
    try {
        const response = await actionFetchWrapper<AdminUserInvitationStatusResponse>({
            url: invitationUrl(userId), method: 'POST', schema: adminUserInvitationStatusResponseSchema,
        });
        return response.data;
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Não foi possível reenviar o convite.'), { cause: error });
    }
}

async function revokeUserActivationInvitationActionImpl(userId: number): Promise<void> {
    try {
        await actionFetchWrapper<unknown>({
            url: invitationUrl(userId), method: 'DELETE', schema: z.unknown(),
        });
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Não foi possível revogar o convite.'), { cause: error });
    }
}


export async function getUserActivationInvitationAction(...args: Parameters<typeof getUserActivationInvitationActionImpl>) {
    return captureAction(() => getUserActivationInvitationActionImpl(...args));
}


export async function resendUserActivationInvitationAction(...args: Parameters<typeof resendUserActivationInvitationActionImpl>) {
    return captureAction(() => resendUserActivationInvitationActionImpl(...args));
}


export async function revokeUserActivationInvitationAction(...args: Parameters<typeof revokeUserActivationInvitationActionImpl>) {
    return captureAction(() => revokeUserActivationInvitationActionImpl(...args));
}
