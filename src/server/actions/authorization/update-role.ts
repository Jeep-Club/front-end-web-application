'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { roleResponseSchema } from "@/schemas/authorization/detail";

async function updateRoleActionImpl(roleId: number, data: UpdateRoleRequest): Promise<RoleResponse> {
    try {
        const response = await actionFetchWrapper<RoleResponse>({
            url: `${HttpAPIRoutes.AUTHORIZATION_ROLES}/${roleId}`,
            method: 'PUT',
            schema: roleResponseSchema,
            body: JSON.stringify(data),
        });

        return response.data;
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Erro ao atualizar cargo'), { cause: error });
    }
}


export async function updateRoleAction(...args: Parameters<typeof updateRoleActionImpl>) {
    return captureAction(() => updateRoleActionImpl(...args));
}
