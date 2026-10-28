'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import z from 'zod';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { ForgotPasswordRequestType } from "@/schemas/auth/forgot-password/forgotPasswordRequest";
import { HttpAPIRoutes } from '@/utils/http/api';
import { extractApiErrorMessage } from '@/utils/http/apiError';

async function forgotPasswordActionImpl({ cpf }: ForgotPasswordRequestType) {
    try {
        await actionFetchWrapper({
            url: HttpAPIRoutes.PASSWORD_RECOVERY_REQUEST,
            method: 'POST',
            body: JSON.stringify({ cpf }),
            schema: z.any()
        });

        return { success: true };
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Erro ao solicitar a troca de senha. Verifique o CPF e tente novamente.'), { cause: error });
    }
}

export default async function forgotPasswordAction(...args: Parameters<typeof forgotPasswordActionImpl>) {
    return captureAction(() => forgotPasswordActionImpl(...args));
}
