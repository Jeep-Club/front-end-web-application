'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { deleteRoleResponseSchema } from "@/schemas/authorization/delete";

async function deleteRoleActionImpl(roleId: number) {
    try {
        await actionFetchWrapper({
            url: `${HttpAPIRoutes.AUTHORIZATION_ROLES}/${roleId}`,
            method: 'DELETE',
            schema: deleteRoleResponseSchema,
        });
    } catch (error) {
        throw new ActionError(extractApiErrorMessage(error, 'Erro ao excluir cargo'), { cause: error });
    }
}


export async function deleteRoleAction(...args: Parameters<typeof deleteRoleActionImpl>) {
    return captureAction(() => deleteRoleActionImpl(...args));
}
