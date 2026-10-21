'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import { adminUserSchema } from "@/schemas/admin/users";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from '@/utils/http/api';
import { extractApiErrorMessage } from "@/utils/http/apiError";

interface Props {
    userId: number;
    status: 'enable' | 'disable';
}

async function patchUserStatusActionImpl({ userId, status }: Props) {
    try {
        const res = await actionFetchWrapper<AdminUser>({
            url: `${HttpAPIRoutes.ADMIN_USERS}/${userId}/${status}`,
            method: "PATCH",
            schema: adminUserSchema
        });

        return res.data;
    } catch (error) {
        const fallback = status === "disable"
            ? "Não foi possível desativar o usuário. Tente novamente."
            : "Não foi possível reativar o usuário. Tente novamente.";
        throw new ActionError(extractApiErrorMessage(error, fallback), { cause: error });
    }
}


export async function patchUserStatusAction(...args: Parameters<typeof patchUserStatusActionImpl>) {
    return captureAction(() => patchUserStatusActionImpl(...args));
}
