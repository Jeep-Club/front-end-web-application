'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import { z } from 'zod';
import { fetchWrapper } from '@/services/fetchWrapper/fetchWrapper';
import { HttpAPIRoutes } from '@/utils/http/api';
import { extractApiErrorMessage } from '@/utils/http/apiError';
import { getFrontendAccessHeaders } from '@/services/fetchWrapper/frontendAccess';

const noContentSchema = z.literal('');

async function publicActivationRequest(url: string, body: unknown) {
    const apiUrl = process.env.API_URL;
    if (!apiUrl) throw new ActionError('API_URL não está configurada.');
    return fetchWrapper({
        url: `${apiUrl.replace(/\/$/, '')}/${url}`,
        method: 'POST',
        headers: getFrontendAccessHeaders(),
        body: JSON.stringify(body),
        schema: noContentSchema,
    });
}

async function validateAccountActivationInvitationActionImpl(token: string) {
    try {
        await publicActivationRequest(HttpAPIRoutes.PUBLIC_ACTIVATION_INVITATION_VALIDATION, { token });
        return true;
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Este convite é inválido ou expirou.'), { cause: error });
    }
}

async function activateAccountWithInvitationActionImpl(input: { token: string; newPassword: string }) {
    try {
        await publicActivationRequest(HttpAPIRoutes.PUBLIC_ACCOUNT_ACTIVATION, input);
        return true;
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Não foi possível ativar a conta. Confira o convite e tente novamente.'), { cause: error });
    }
}


export async function validateAccountActivationInvitationAction(...args: Parameters<typeof validateAccountActivationInvitationActionImpl>) {
    return captureAction(() => validateAccountActivationInvitationActionImpl(...args));
}


export async function activateAccountWithInvitationAction(...args: Parameters<typeof activateAccountWithInvitationActionImpl>) {
    return captureAction(() => activateAccountWithInvitationActionImpl(...args));
}
