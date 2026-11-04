'use server';

import { rolePermissionMutationResponseSchema } from "@/schemas/authorization/rolePermission";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

export async function revokePermissionFromRoleAction(roleId: number, permissionId: number) {
    await actionFetchWrapper({
        url: `${HttpAPIRoutes.AUTHORIZATION_ROLES}/${roleId}/permissions/${permissionId}`,
        method: 'DELETE',
        schema: rolePermissionMutationResponseSchema,
    });
}
