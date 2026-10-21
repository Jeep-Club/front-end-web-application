'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { adminUserSchema } from "@/schemas/admin/users";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";

async function getAdminUserActionImpl(userId: number): Promise<AdminUser> {
    try {
        const response = await actionFetchWrapper<AdminUser>({
            url: `${HttpAPIRoutes.ADMIN_USERS}/${userId}`,
            method: "GET",
            schema: adminUserSchema,
        });

        return response.data;
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, "Não foi possível carregar os dados deste usuário."), { cause: error });
    }
}


export async function getAdminUserAction(...args: Parameters<typeof getAdminUserActionImpl>) {
    return captureAction(() => getAdminUserActionImpl(...args));
}
