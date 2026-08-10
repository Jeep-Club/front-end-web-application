'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { rolePermissionMutationResponseSchema } from "@/schemas/authorization/rolePermission";

export async function assignPermissionToRoleAction(roleId: number, permissionId: number) {
    try {
        await actionFetchWrapper({
            url: `${HttpAPIRoutes.AUTHORIZATION_ROLES}/${roleId}/permissions/${permissionId}`,
            method: 'POST',
            schema: rolePermissionMutationResponseSchema,
        });
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Erro ao atribuir permissão ao cargo'), { cause: error });
    }
}
