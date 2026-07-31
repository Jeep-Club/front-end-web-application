'use server';

import z from 'zod';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { ForgotPasswordRequestType } from "@/schemas/auth/forgot-password/forgotPasswordRequest";
import { HttpAPIRoutes } from '@/utils/http/api';

export default async function forgotPasswordEmailTokenAction({ cpf }: ForgotPasswordRequestType) {
    try {
        await actionFetchWrapper({
            url: HttpAPIRoutes.PASSWORD_RECOVERY_EMAIL_TOKEN,
            method: 'POST',
            body: JSON.stringify({ cpf }),
            schema: z.any()
        });

        return { success: true };
    } catch (error) {
        throw new Error('Erro ao enviar o e-mail de redefinição. Tente novamente.', { cause: error });
    }
}
