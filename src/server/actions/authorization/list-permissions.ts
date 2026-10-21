'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { permissionListResponseSchema } from "@/schemas/authorization/permission";

async function listPermissionsActionImpl(): Promise<PermissionResponse[]> {
    try {
        const response = await actionFetchWrapper<PermissionResponse[]>({
            url: HttpAPIRoutes.PERMISSIONS,
            method: 'GET',
            schema: permissionListResponseSchema,
        });

        return response.data;
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Erro ao listar permissões'), { cause: error });
    }
}


export async function listPermissionsAction(...args: Parameters<typeof listPermissionsActionImpl>) {
    return captureAction(() => listPermissionsActionImpl(...args));
}
