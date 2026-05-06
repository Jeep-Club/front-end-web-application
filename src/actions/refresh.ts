'use server';
import z from 'zod';
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";

//apenas para testes

interface MockRefreshResponse {
    message: string;
}

const mockRefreshResponseSchema = z.object({
    message: z.string()
});

export async function refreshAction() {
    try {
        const response = await actionFetchWrapper<MockRefreshResponse>({
            url: '/api/mock/refresh',
            method: 'GET',
            schema: mockRefreshResponseSchema
        }); 
        return response.data.message;
    } catch (error) {
        throw new Error('Erro ao fazer refresh', { cause: error });
    }
}