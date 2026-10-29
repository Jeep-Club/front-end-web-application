'use server';

import { ForgotPasswordRequestType } from "@/schemas/auth/forgot-password/forgotPasswordRequest";
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { HttpAPIRoutes } from '@/utils/http/api';
import z from 'zod';

export default async function forgotPasswordAction({ cpf }: ForgotPasswordRequestType) {
    await actionFetchWrapper({
        url: HttpAPIRoutes.PASSWORD_RECOVERY_REQUEST,
        method: 'POST',
        body: JSON.stringify({ cpf }),
        schema: z.any()
    });

    return { success: true };
}
