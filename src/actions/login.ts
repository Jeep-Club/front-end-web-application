'use server';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { loginResponseSchema } from "@/schemas/auth/login/loginResponse";
import { login } from '@/utils/auth/login';
import { HttpAPIRoutes } from '@/utils/http/api';

export default async function loginAction({ cpf, password }: LoginRequest) {

    if (!password || !cpf) {
        throw new Error('CPF e password são obrigatórios');
    }
    try {
        const response = await actionFetchWrapper<LoginResponse>({
            url: HttpAPIRoutes.LOGIN,
            method: 'POST',
            body: JSON.stringify({ cpf, password }),
            schema: loginResponseSchema
        });

        const { data } = response;


        await login(data.AuthAccessToken, data.AuthRefreshToken, data.AccessTokenExpiration);
       
        return data;
    } catch (error) {
        throw new Error('Erro ao fazer login', { cause: error });
    }
}