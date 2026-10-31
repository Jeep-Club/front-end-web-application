'use server';

import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { logout } from '@/utils/auth/logout';
import { HttpAPIRoutes } from '@/utils/http/api';
import { z } from 'zod';

export default async function logoutAction() {
    if (process.env.API_URL) {
        try {
            await actionFetchWrapper({ url: HttpAPIRoutes.LOGOUT, method: 'POST', schema: z.void() });
        } catch {
            // An explicit logout must clear local cookies even if the API is unavailable.
        }
    }
    await logout();
}
