'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { roleResponseSchema } from "@/schemas/authorization/detail";

async function deactivateRoleActionImpl(roleId: number): Promise<RoleResponse> {
    try {
        const response = await actionFetchWrapper<RoleResponse>({
            url: `${HttpAPIRoutes.AUTHORIZATION_ROLES}/${roleId}/deactivate`,
            method: 'PATCH',
            schema: roleResponseSchema,
        });

        return response.data;
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Erro ao desativar cargo'), { cause: error });
    }
}


export async function deactivateRoleAction(...args: Parameters<typeof deactivateRoleActionImpl>) {
    return captureAction(() => deactivateRoleActionImpl(...args));
}
