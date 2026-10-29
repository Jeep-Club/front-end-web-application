'use server';

import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { getFrontendAccessHeaders } from '@/services/fetchWrapper/frontendAccess';
import { HttpAPIRoutes } from '@/utils/http/api';
import { z } from 'zod';

const noContentSchema = z.literal('');

async function publicActivationRequest(url: string, body: unknown) {
    return actionFetchWrapper({
        url,
        method: 'POST',
        headers: getFrontendAccessHeaders(),
        body: JSON.stringify(body),
        schema: noContentSchema,
    });
}

export async function validateAccountActivationInvitationAction(token: string) {
    await publicActivationRequest(HttpAPIRoutes.PUBLIC_ACTIVATION_INVITATION_VALIDATION, { token });
    return true;
}

export async function activateAccountWithInvitationAction(input: { token: string; newPassword: string }) {
    await publicActivationRequest(HttpAPIRoutes.PUBLIC_ACCOUNT_ACTIVATION, input);
    return true;
}
