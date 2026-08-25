'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { adminUserListResponseSchema } from "@/schemas/admin/users";
import { extractApiErrorMessage } from "@/utils/http/apiError";

export async function listAdminUsersAction(
    searchParams: AdminUserSearchParams,
): Promise<PageResponse<AdminUser>> {
    const query = new URLSearchParams(
        Object.entries(searchParams).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string",
        ),
    );

    try {
        const response = await actionFetchWrapper<PageResponse<AdminUser>>({
            url: `${HttpAPIRoutes.ADMIN_USERS}?${query.toString()}`,
            method: "GET",
            schema: adminUserListResponseSchema,
        });

        return response.data;
    } catch (error) {
        throw new Error(extractApiErrorMessage(error, "Erro ao carregar usuários"), { cause: error });
    }
}
