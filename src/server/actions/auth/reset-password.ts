'use server';

import { ResetPasswordRequestType, resetPasswordRequestSchema } from '@/schemas/auth/reset-password/resetPasswordRequest';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { HttpAPIRoutes } from '@/utils/http/api';
import { ActionError } from '@/utils/http/ActionError';
import { z } from 'zod';

type ResetPasswordActionParams = ResetPasswordRequestType & { token: string };

export default async function resetPasswordAction(data: ResetPasswordActionParams) {
    if (!data.token?.trim()) throw new ActionError('Token de segurança ausente ou inválido.');
    const parsed = resetPasswordRequestSchema.safeParse(data);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0].message);
    await actionFetchWrapper({
        url: HttpAPIRoutes.PASSWORD_RECOVERY_RESET, method: 'POST', schema: z.void(),
        body: JSON.stringify({ token: data.token, newPassword: parsed.data.password }),
    });
    return { success: true };
}
