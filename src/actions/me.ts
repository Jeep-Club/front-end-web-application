'use server';

import z from 'zod';
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from '@/utils/http/api';
import { meResponseSchema } from '@/schemas/auth/me/meResponse';

export async function meAction() {
    try {
            const response = await actionFetchWrapper<MeResponse>({
                url: HttpAPIRoutes.ME,
                method: 'GET',
                schema: meResponseSchema
            });
            return response.data;
        } catch (error) {
            throw new Error('Erro ao fazer refresh', { cause: error });
        }
}