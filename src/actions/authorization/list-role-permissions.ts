'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { permissionListResponseSchema } from "@/schemas/authorization/permission";

export async function listRolePermissionsAction(roleId: number): Promise<PermissionResponse[]> {
    try {
        const response = await actionFetchWrapper<PermissionResponse[]>({
            url: `${HttpAPIRoutes.AUTHORIZATION_ROLES}/${roleId}/permissions`,
            method: 'GET',
            schema: permissionListResponseSchema,
        });

        return response.data;
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Erro ao listar permissões do cargo'), { cause: error });
    }
}
