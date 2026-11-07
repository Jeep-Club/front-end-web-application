'use server';

import { permissionListResponseSchema } from "@/schemas/authorization/permission";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

export async function listPermissionsAction(): Promise<PermissionResponse[]> {
    const response = await actionFetchWrapper<PermissionResponse[]>({
        url: HttpAPIRoutes.PERMISSIONS,
        method: 'GET',
        schema: permissionListResponseSchema,
    });

    return response.data;
}
