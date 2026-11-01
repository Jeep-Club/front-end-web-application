'use server';

import { registerResponseSchema } from '@/schemas/auth/register/registerResponse';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { login } from '@/utils/auth/login';
import { HttpAPIRoutes } from '@/utils/http/api';
import { registerRequestSchema, registerSubmissionSchema, type RegisterSubmission } from '@/schemas/auth/register/registerRequest';

export async function registerAction(data: RegisterSubmission) {
    const validation = registerSubmissionSchema.safeParse(data);
    if (!validation.success) {
        throw new Error(validation.error.issues[0]?.message || 'Revise os dados do cadastro.');
    }

    // O aceite é validado nesta ação. A API continua recebendo seu contrato atual;
    // guardar uma evidência durável do aceite exige suporte específico no backend.
    const registerRequest = registerRequestSchema.parse(validation.data);
    try {
        const response = await actionFetchWrapper<RegisterResponse>({
            url: HttpAPIRoutes.REGISTER,
            method: 'POST',
            body: JSON.stringify(registerRequest),
            schema: registerResponseSchema
        });
        await login(response.data.accessToken, response.data.refreshToken, new Date(Date.now() + response.data.expiresInSeconds * 1000).toISOString());
        return response.data;
    } catch (error) {
        console.log('Error in registerAction:', error);
        throw new Error('Erro ao realizar cadastro, tente novamente.');
    }

}
