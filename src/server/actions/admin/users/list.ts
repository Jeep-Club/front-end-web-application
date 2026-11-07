'use server';

import { adminUserListResponseSchema } from "@/schemas/admin/users";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

export async function listAdminUsersAction(
    searchParams: AdminUserSearchParams,
): Promise<PageResponse<AdminUser>> {
    const query = new URLSearchParams(
        Object.entries(searchParams).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string",
        ).filter(([key, value]) => key !== "status" || value !== "ALL"),
    );

    const response = await actionFetchWrapper<PageResponse<AdminUser>>({
        url: `${HttpAPIRoutes.ADMIN_USERS}?${query.toString()}`,
        method: "GET",
        schema: adminUserListResponseSchema,
    });

    return response.data;
}
