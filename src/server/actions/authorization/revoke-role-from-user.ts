'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import { z } from 'zod';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { HttpAPIRoutes } from '@/utils/http/api';
import { extractApiErrorMessage } from '@/utils/http/apiError';

const ignoredResponseSchema = z.unknown();

async function revokeRoleFromUserActionImpl(userId: number, roleId: number): Promise<void> {
  try {
    await actionFetchWrapper({
      url: `${HttpAPIRoutes.USER_ROLES.replace('{id}', String(userId))}/${roleId}`,
      method: 'DELETE',
      schema: ignoredResponseSchema,
    });
  } catch (error) {
    throw new ActionError(extractApiErrorMessage(error, 'Não foi possível revogar o cargo.'), { cause: error });
  }
}


export async function revokeRoleFromUserAction(...args: Parameters<typeof revokeRoleFromUserActionImpl>) {
    return captureAction(() => revokeRoleFromUserActionImpl(...args));
}
