'use server';

import { roleListResponseSchema } from "@/schemas/authorization/list";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

export async function listUserRolesAction(userId: number): Promise<RoleListResponse> {
    const response = await actionFetchWrapper<RoleListResponse>({
        url: HttpAPIRoutes.USER_ROLES.replace("{id}", String(userId)),
        method: 'GET',
        schema: roleListResponseSchema,
    });

    return response.data;
}
