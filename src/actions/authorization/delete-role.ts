'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { deleteRoleResponseSchema } from "@/schemas/authorization/delete";

export async function deleteRoleAction(roleId: number) {
    try {
        await actionFetchWrapper({
            url: `${HttpAPIRoutes.AUTHORIZATION_ROLES}/${roleId}`,
            method: 'DELETE',
            schema: deleteRoleResponseSchema,
        });
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Erro ao excluir cargo'), { cause: error });
    }
}
