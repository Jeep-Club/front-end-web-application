'use server';

import { ForgotPasswordRequestType } from "@/schemas/auth/forgot-password/forgotPasswordRequest";
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { HttpAPIRoutes } from '@/utils/http/api';
import { passwordRecoveryResponseSchema } from '@/schemas/auth/recovery';

export default async function forgotPasswordAction({ cpf }: ForgotPasswordRequestType) {
    await actionFetchWrapper({
        url: HttpAPIRoutes.PASSWORD_RECOVERY_REQUEST,
        method: 'POST',
        body: JSON.stringify({ cpf }),
        schema: passwordRecoveryResponseSchema
    });

    return { success: true };
}
