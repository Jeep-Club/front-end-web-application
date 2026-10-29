'use server';

import { ForgotPasswordRequestType } from "@/schemas/auth/forgot-password/forgotPasswordRequest";
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { HttpAPIRoutes } from '@/utils/http/api';
import z from 'zod';

export default async function forgotPasswordEmailTokenAction({ cpf }: ForgotPasswordRequestType) {
    await actionFetchWrapper({
        url: HttpAPIRoutes.PASSWORD_RECOVERY_EMAIL_TOKEN,
        method: 'POST',
        body: JSON.stringify({ cpf }),
        schema: z.any()
    });

    return { success: true };
}
