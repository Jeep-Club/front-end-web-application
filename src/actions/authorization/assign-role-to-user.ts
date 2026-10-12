'use server';

import { z } from 'zod';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { HttpAPIRoutes } from '@/utils/http/api';
import { extractApiErrorMessage } from '@/utils/http/apiError';

const noContentSchema = z.union([z.literal(''), z.null()]);

export async function assignRoleToUserAction(userId: number, roleId: number): Promise<void> {
  try {
    await actionFetchWrapper({
      url: `${HttpAPIRoutes.USER_ROLES.replace('{id}', String(userId))}/${roleId}`,
      method: 'POST',
      schema: noContentSchema,
    });
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, 'Não foi possível atribuir o cargo.'), { cause: error });
  }
}
