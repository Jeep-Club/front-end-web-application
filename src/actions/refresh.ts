'use server';
import z from 'zod';
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from '@/utils/http/api';
import { refreshTokenResponseSchema } from '@/schemas/auth/refresh/refreshTokenResponse';

//apenas para testes

const mockRefreshResponseSchema = z.object({
    message: z.string()
});

export async function refreshAction() {
    try {
        const response = await actionFetchWrapper<RefreshTokenResponse>({
            url: HttpAPIRoutes.REFRESH,
            method: 'POST',
            schema: refreshTokenResponseSchema
        }); 
    } catch (error) {
        throw new Error('Erro ao fazer refresh', { cause: error });
    }
}