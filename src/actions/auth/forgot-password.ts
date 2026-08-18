'use server';

import z from 'zod';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { ForgotPasswordRequestType } from "@/schemas/auth/forgot-password/forgotPasswordRequest";
import { HttpAPIRoutes } from '@/utils/http/api';
import { extractApiErrorMessage } from '@/utils/http/apiError';

export default async function forgotPasswordAction({ cpf }: ForgotPasswordRequestType) {
    try {
        await actionFetchWrapper({
            url: HttpAPIRoutes.PASSWORD_RECOVERY_REQUEST,
            method: 'POST',
            body: JSON.stringify({ cpf }),
            schema: z.any()
        });

        return { success: true };
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Erro ao solicitar a troca de senha. Verifique o CPF e tente novamente.'), { cause: error });
    }
}