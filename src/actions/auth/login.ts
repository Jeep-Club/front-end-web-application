'use server';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { loginResponseSchema } from "@/schemas/auth/login/loginResponse";
import { login } from '@/utils/auth/login';
import { HttpAPIRoutes } from '@/utils/http/api';
import {
    authorizationMeResponseSchema,
    identityMeResponseSchema,
    meResponseSchema,
} from '@/schemas/auth/me/me';
import { me } from '@/utils/auth/me';
import { logout } from '@/utils/auth/logout';
import { unMaskCPF } from '@/utils/masks/maskCPF';
import { extractApiErrorMessage } from '@/utils/http/apiError';

export default async function loginAction({ cpf, senha }: LoginRequest) {
    if (!senha || !cpf) {
        throw new Error('CPF e senha são obrigatórios');
    }

    const cleanCpf = unMaskCPF(cpf);


    try {
        const response = await actionFetchWrapper<LoginResponse>({
            url: HttpAPIRoutes.LOGIN,
            method: 'POST',
            body: JSON.stringify({ cpf: cleanCpf, senha }),
            schema: loginResponseSchema
        });

        const { data } = response;

        if ('accessToken' in data) {
            await login(
                data.accessToken,
                data.refreshToken,
                new Date(Date.now() + data.expiresInSeconds * 1000).toISOString(),
            );

            const [sessionResponse, identityResponse, authorizationResponse] = await Promise.all([
                actionFetchWrapper<MeResponse>({
                    url: HttpAPIRoutes.AUTHENTICATION_ME,
                    method: 'GET',
                    schema: meResponseSchema
                }),
                actionFetchWrapper<IdentityMeResponse>({
                    url: HttpAPIRoutes.IDENTITY_ME,
                    method: 'GET',
                    schema: identityMeResponseSchema
                }),
                actionFetchWrapper<AuthorizationMeResponse>({
                    url: HttpAPIRoutes.AUTHORIZATION_ME,
                    method: 'GET',
                    schema: authorizationMeResponseSchema
                }),
            ]);

            await me(sessionResponse.data, identityResponse.data, authorizationResponse.data);
        } else {
            throw new Error('É necessário trocar a senha para acessar o sistema');
        }

        return data;
    } catch (error) {
        // The /me request happens after tokens are stored. If any step fails,
        // do not leave a partial session in the browser.
        await logout();
        throw new Error(
            extractApiErrorMessage(error, 'Erro ao realizar login. Verifique suas credenciais e tente novamente.'),
            { cause: error },
        );
    }
}

