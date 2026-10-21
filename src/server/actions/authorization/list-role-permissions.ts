'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { permissionListResponseSchema } from "@/schemas/authorization/permission";

async function listRolePermissionsActionImpl(roleId: number): Promise<PermissionResponse[]> {
    try {
        const response = await actionFetchWrapper<PermissionResponse[]>({
            url: `${HttpAPIRoutes.AUTHORIZATION_ROLES}/${roleId}/permissions`,
            method: 'GET',
            schema: permissionListResponseSchema,
        });

        return response.data;
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Erro ao listar permissões do cargo'), { cause: error });
    }
}


export async function listRolePermissionsAction(...args: Parameters<typeof listRolePermissionsActionImpl>) {
    return captureAction(() => listRolePermissionsActionImpl(...args));
}
