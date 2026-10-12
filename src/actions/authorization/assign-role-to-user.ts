'use server';

import { z } from 'zod';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { HttpAPIRoutes } from '@/utils/http/api';
import { extractApiErrorMessage } from '@/utils/http/apiError';

// The endpoint may return an empty body or the created link; the response is unused.
const ignoredResponseSchema = z.unknown();

export async function assignRoleToUserAction(userId: number, roleId: number): Promise<void> {
  try {
    await actionFetchWrapper({
      url: `${HttpAPIRoutes.USER_ROLES.replace('{id}', String(userId))}/${roleId}`,
      method: 'POST',
      schema: ignoredResponseSchema,
    });
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, 'Não foi possível atribuir o cargo.'), { cause: error });
  }
}
