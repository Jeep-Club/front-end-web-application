'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { rolePermissionMutationResponseSchema } from "@/schemas/authorization/rolePermission";

async function assignPermissionToRoleActionImpl(roleId: number, permissionId: number) {
    try {
        await actionFetchWrapper({
            url: `${HttpAPIRoutes.AUTHORIZATION_ROLES}/${roleId}/permissions/${permissionId}`,
            method: 'POST',
            schema: rolePermissionMutationResponseSchema,
        });
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Erro ao atribuir permissão ao cargo'), { cause: error });
    }
}


export async function assignPermissionToRoleAction(...args: Parameters<typeof assignPermissionToRoleActionImpl>) {
    return captureAction(() => assignPermissionToRoleActionImpl(...args));
}
