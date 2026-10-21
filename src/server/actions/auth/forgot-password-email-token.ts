'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import z from 'zod';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { ForgotPasswordRequestType } from "@/schemas/auth/forgot-password/forgotPasswordRequest";
import { HttpAPIRoutes } from '@/utils/http/api';
import { extractApiErrorMessage } from '@/utils/http/apiError';

async function forgotPasswordEmailTokenActionImpl({ cpf }: ForgotPasswordRequestType) {
    try {
        await actionFetchWrapper({
            url: HttpAPIRoutes.PASSWORD_RECOVERY_EMAIL_TOKEN,
            method: 'POST',
            body: JSON.stringify({ cpf }),
            schema: z.any()
        });

        return { success: true };
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Erro ao enviar o e-mail de redefinição. Tente novamente.'), { cause: error });
    }
}


export default async function forgotPasswordEmailTokenAction(...args: Parameters<typeof forgotPasswordEmailTokenActionImpl>) {
    return captureAction(() => forgotPasswordEmailTokenActionImpl(...args));
}
