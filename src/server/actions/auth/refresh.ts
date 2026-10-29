'use server';

import { refreshTokenResponseSchema } from '@/schemas/auth/refresh/refreshTokenResponse';
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from '@/utils/http/api';

export async function refreshAction() {
    await actionFetchWrapper<RefreshTokenResponse>({
        url: HttpAPIRoutes.REFRESH,
        method: 'POST',
        schema: refreshTokenResponseSchema
    });
}
