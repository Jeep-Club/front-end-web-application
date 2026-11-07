'use server';

import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { HttpAPIRoutes } from '@/utils/http/api';
import { z } from 'zod';

const ignoredResponseSchema = z.unknown();

export async function revokeRoleFromUserAction(userId: number, roleId: number): Promise<void> {
    await actionFetchWrapper({
        url: `${HttpAPIRoutes.USER_ROLES.replace('{id}', String(userId))}/${roleId}`,
        method: 'DELETE',
        schema: ignoredResponseSchema,
    });
}
