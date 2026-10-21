'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { rolePermissionMutationResponseSchema } from "@/schemas/authorization/rolePermission";

async function revokePermissionFromRoleActionImpl(roleId: number, permissionId: number) {
    try {
        await actionFetchWrapper({
            url: `${HttpAPIRoutes.AUTHORIZATION_ROLES}/${roleId}/permissions/${permissionId}`,
            method: 'DELETE',
            schema: rolePermissionMutationResponseSchema,
        });
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Erro ao remover permissão do cargo'), { cause: error });
    }
}


export async function revokePermissionFromRoleAction(...args: Parameters<typeof revokePermissionFromRoleActionImpl>) {
    return captureAction(() => revokePermissionFromRoleActionImpl(...args));
}
