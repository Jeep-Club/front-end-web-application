'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";
import z from 'zod';
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from '@/utils/http/api';
import { refreshTokenResponseSchema } from '@/schemas/auth/refresh/refreshTokenResponse';
import { extractApiErrorMessage } from '@/utils/http/apiError';

//apenas para testes

const mockRefreshResponseSchema = z.object({
    message: z.string()
});

async function refreshActionImpl() {
    try {
        const response = await actionFetchWrapper<RefreshTokenResponse>({
            url: HttpAPIRoutes.REFRESH,
            method: 'POST',
            schema: refreshTokenResponseSchema
        });
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Erro ao fazer refresh'), { cause: error });
    }
}

export async function refreshAction(...args: Parameters<typeof refreshActionImpl>) {
    return captureAction(() => refreshActionImpl(...args));
}
