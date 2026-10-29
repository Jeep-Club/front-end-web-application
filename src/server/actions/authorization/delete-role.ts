'use server';

import { deleteRoleResponseSchema } from "@/schemas/authorization/delete";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

export async function deleteRoleAction(roleId: number) {
    await actionFetchWrapper({
        url: `${HttpAPIRoutes.AUTHORIZATION_ROLES}/${roleId}`,
        method: 'DELETE',
        schema: deleteRoleResponseSchema,
    });
}
