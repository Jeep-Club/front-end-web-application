'use server';

import { z } from 'zod';
import { fetchWrapper } from '@/services/fetchWrapper/fetchWrapper';
import { HttpAPIRoutes } from '@/utils/http/api';
import { extractApiErrorMessage } from '@/utils/http/apiError';

const noContentSchema = z.literal('');

async function publicActivationRequest(url: string, body: unknown) {
    const apiUrl = process.env.API_URL;
    if (!apiUrl) throw new Error('API_URL não está configurada.');
    return fetchWrapper({
        url: `${apiUrl.replace(/\/$/, '')}/${url}`,
        method: 'POST',
        body: JSON.stringify(body),
        schema: noContentSchema,
    });
}

export async function validateAccountActivationInvitationAction(token: string) {
    try {
        await publicActivationRequest(HttpAPIRoutes.PUBLIC_ACTIVATION_INVITATION_VALIDATION, { token });
        return true;
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Este convite é inválido ou expirou.'), { cause: error });
    }
}

export async function activateAccountWithInvitationAction(input: { token: string; newPassword: string }) {
    try {
        await publicActivationRequest(HttpAPIRoutes.PUBLIC_ACCOUNT_ACTIVATION, input);
        return true;
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Não foi possível ativar a conta. Confira o convite e tente novamente.'), { cause: error });
    }
}
