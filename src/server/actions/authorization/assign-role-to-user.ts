'use server';

import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { HttpAPIRoutes } from '@/utils/http/api';
import { z } from 'zod';

// The endpoint may return an empty body or the created link; the response is unused.
const ignoredResponseSchema = z.unknown();

export async function assignRoleToUserAction(userId: number, roleId: number): Promise<void> {
    await actionFetchWrapper({
        url: `${HttpAPIRoutes.USER_ROLES.replace('{id}', String(userId))}/${roleId}`,
        method: 'POST',
        schema: ignoredResponseSchema,
    });
}
