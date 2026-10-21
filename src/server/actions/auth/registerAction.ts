'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import { registerResponseSchema } from '@/schemas/auth/register/registerResponse';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { login } from '@/utils/auth/login';
import { HttpAPIRoutes } from '@/utils/http/api';
import { extractApiErrorMessage } from '@/utils/http/apiError';

async function registerActionImpl(data: RegisterRequest) {
    try {
        const response = await actionFetchWrapper<RegisterResponse>({
            url: HttpAPIRoutes.REGISTER,
            method: 'POST',
            body: JSON.stringify(data),
            schema: registerResponseSchema
        });
        login(response.data.accessToken, response.data.refreshToken, new Date(Date.now() + response.data.expiresInSeconds * 1000).toISOString());
        return response.data;
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Erro ao realizar cadastro, tente novamente.'), { cause: error });
    }

}

export async function registerAction(...args: Parameters<typeof registerActionImpl>) {
    return captureAction(() => registerActionImpl(...args));
}
