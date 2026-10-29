'use server';

import { loginResponseSchema } from "@/schemas/auth/login/loginResponse";
import {
	authorizationMeResponseSchema,
	identityMeResponseSchema,
	meResponseSchema,
} from '@/schemas/auth/me/me';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { authCookieOptions } from "@/utils/auth/cookieOptions";
import { login } from '@/utils/auth/login';
import { logout } from '@/utils/auth/logout';
import { me } from '@/utils/auth/me';
import { ActionError } from "@/utils/http/ActionError";
import { HttpAPIRoutes } from '@/utils/http/api';
import { unMaskCPF } from '@/utils/masks/maskCPF';
import { cookies } from "next/headers";

export default async function loginAction({ cpf, senha }: LoginRequest) {
    if (!senha || !cpf) {
        throw new ActionError('CPF e senha são obrigatórios');
    }

    const cleanCpf = unMaskCPF(cpf);

    try {
        const cookieStore = await cookies();
        cookieStore.delete("FirstAccessPasswordChangeToken");
        cookieStore.delete("FirstAccessPasswordChangePending");
        const response = await actionFetchWrapper<LoginResponse>({
            url: HttpAPIRoutes.LOGIN,
            method: 'POST',
            body: JSON.stringify({ cpf: cleanCpf, senha }),
            schema: loginResponseSchema
        });

        const { data } = response;

        if ('passwordChangeToken' in data) {
            const expires = new Date(data.passwordChangeTokenExpiresAt);
            cookieStore.set("FirstAccessPasswordChangeToken", data.passwordChangeToken, {
                ...authCookieOptions(true),
                expires,
            });
            const isFirstAccessChange = data.status === "PASSWORD_CHANGE_REQUIRED" || data.status === "FIRST_ACCESS_PASSWORD_CHANGE_REQUIRED";
            cookieStore.set("FirstAccessPasswordChangePending", String(isFirstAccessChange), {
                ...authCookieOptions(true),
                expires,
            });
            return { status: data.status };
        }

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
            throw new ActionError('É necessário trocar a senha para acessar o sistema');
        }

        return data;
    } catch (error) {
        // The /me request happens after tokens are stored. If any step fails,
        // do not leave a partial session in the browser.
        await logout();
        throw error;
    }
}
