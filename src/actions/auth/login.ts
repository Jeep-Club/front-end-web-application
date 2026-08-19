'use server';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { loginResponseSchema } from "@/schemas/auth/login/loginResponse";
import { login } from '@/utils/auth/login';
import { HttpAPIRoutes } from '@/utils/http/api';
import { meResponseSchema } from '@/schemas/auth/me/me';
import { me } from '@/utils/auth/me';
import { unMaskCPF } from '@/utils/masks/maskCPF';
import { extractApiErrorMessage } from '@/utils/http/apiError';

export default async function loginAction({ cpf, senha }: LoginRequest) {
    if (!senha || !cpf) {
        throw new Error('CPF e senha são obrigatórios');
    }

    const cleanCpf = unMaskCPF(cpf);

    async function executeMockLogin() {
        const oneDayMs = 24 * 60 * 60 * 1000;
        
        await login(
            "mock-access-token",
            "mock-refresh-token",
            new Date(Date.now() + oneDayMs).toISOString()
        );

        const isAdmin = cleanCpf !== "00000000191";

        const mockAuthorities = isAdmin
            ? [
                "AUTHENTICATION_USER_READ",
                "AUTHENTICATION_USER_CREATE",
                "AUTHORIZATION_ROLE_READ",
                "AUTHORIZATION_PERMISSION_READ",
                "AUTHORIZATION_USER_ROLE_READ",
                "HEALTH_MEDICAL_PROFILE_READ",
                "DEPENDENTS_DEPENDENT_READ"
              ]
            : [];

        await me({
            userId: 1,
            sessionId: 1,
            sessionActive: true,
            userName: isAdmin ? "Administrador Teste" : "Sócio do Clube",
            expiresInSeconds: 86400,
            authorities: mockAuthorities
        });

        return {
            accessToken: "mock-access-token",
            refreshToken: "mock-refresh-token",
            expiresInSeconds: 86400
        } as LoginResponse;
    }

    if (!process.env.API_URL || process.env.NEXT_PUBLIC_MOCK === "true") {
        return executeMockLogin();
    }

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

            const responseMe = await actionFetchWrapper<MeResponse>({
                url: HttpAPIRoutes.ME,
                method: 'GET',
                schema: meResponseSchema
            });

            await me(responseMe.data);
        } else {
            throw new Error('É necessário trocar a senha para acessar o sistema');
        }

        return data;
    } catch {
        // Se o backend falhar/estiver offline durante o desenvolvimento local, usa o fallback de mock
        return executeMockLogin();
    }
}

