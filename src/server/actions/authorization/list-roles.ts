'use server';

import { roleListResponseSchema } from "@/schemas/authorization/list";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

export async function listRolesAction(): Promise<RoleResponse[]> {
    const response = await actionFetchWrapper<RoleResponse[]>({
        url: HttpAPIRoutes.AUTHORIZATION_ROLES,
        method: 'GET',
        schema: roleListResponseSchema,
    });

    return response.data;
}
