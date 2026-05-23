'use server';

import z from 'zod';
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from '@/utils/http/api';

export async function meAction() {
    try {
            const response = await actionFetchWrapper({
                url: HttpAPIRoutes.ME,
                method: 'GET',
                schema: z.any()
            });
            return response.data;
        } catch (error) {
            throw new Error('Erro ao fazer refresh', { cause: error });
        }
}