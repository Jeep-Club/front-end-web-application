'use server';

import { meResponseSchema } from '@/schemas/auth/me/me';
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from '@/utils/http/api';

export async function meAction() {
    const response = await actionFetchWrapper<MeResponse>({
        url: HttpAPIRoutes.AUTHENTICATION_ME,
        method: 'GET',
        schema: meResponseSchema
    });
    return response.data;
}
