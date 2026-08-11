'use server';

import z from 'zod';
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from '@/utils/http/api';
import { meResponseSchema } from '@/schemas/auth/me/me';
import { extractApiErrorMessage } from '@/utils/http/apiError';

export async function meAction() {
    try {
            const response = await actionFetchWrapper<MeResponse>({
                url: HttpAPIRoutes.ME,
                method: 'GET',
                schema: meResponseSchema
            });
            return response.data;
        } catch (error) {
            throw new Error(extractApiErrorMessage(error, 'Erro ao buscar dados do usuário'), { cause: error });
        }
}