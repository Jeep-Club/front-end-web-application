'use server';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { loginResponseSchema } from "@/schemas/auth/login/loginResponse";
import { login } from '@/utils/auth/login';
import { HttpAPIRoutes } from '@/utils/http/api';

export default async function loginAction({ cpf, senha }: LoginRequest) {

    if (!senha || !cpf) {
        throw new Error('CPF e senha são obrigatórios');
    }
    try {
        const response = await actionFetchWrapper<LoginResponse>({
            url: HttpAPIRoutes.LOGIN,
            method: 'POST',
            body: JSON.stringify({ cpf, senha }),
            schema: loginResponseSchema
        });

        const { data } = response;


        await login(data.accessToken, data.refreshToken, new Date(Date.now() + data.expiresInSeconds * 1000).toISOString());
       
        return data;
    } catch (error) {
        throw new Error('Erro ao fazer login', { cause: error });
    }
}