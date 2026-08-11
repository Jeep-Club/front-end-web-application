'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { rolePermissionMutationResponseSchema } from "@/schemas/authorization/rolePermission";

export async function revokePermissionFromRoleAction(roleId: number, permissionId: number) {
    try {
        await actionFetchWrapper({
            url: `${HttpAPIRoutes.AUTHORIZATION_ROLES}/${roleId}/permissions/${permissionId}`,
            method: 'DELETE',
            schema: rolePermissionMutationResponseSchema,
        });
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Erro ao remover permissão do cargo'), { cause: error });
    }
}
