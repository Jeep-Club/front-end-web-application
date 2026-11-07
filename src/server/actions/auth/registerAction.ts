'use server';

import { registerRequestSchema, registerSubmissionSchema, type RegisterSubmission } from '@/schemas/auth/register/registerRequest';
import { registerResponseSchema } from '@/schemas/auth/register/registerResponse';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { login } from '@/utils/auth/login';
import { HttpAPIRoutes } from '@/utils/http/api';

export async function registerAction(data: RegisterSubmission) {
    const validation = registerSubmissionSchema.safeParse(data);
    if (!validation.success) {
        throw new Error(validation.error.issues[0]?.message || 'Revise os dados do cadastro.');
    }

    const registerRequest = registerRequestSchema.parse(validation.data);
    const response = await actionFetchWrapper<RegisterResponse>({
        url: HttpAPIRoutes.REGISTER,
        method: 'POST',
        body: JSON.stringify(registerRequest),
        schema: registerResponseSchema
    });
    await login(response.data.accessToken, response.data.refreshToken, new Date(Date.now() + response.data.expiresInSeconds * 1000).toISOString());
    return response.data;

}
