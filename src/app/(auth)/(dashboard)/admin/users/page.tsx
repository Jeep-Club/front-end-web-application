import AdminUsersPage from "@/components/pages/admin/users";
import serverFetchWrapper from "@/services/fetchWrapper/serverFetchWrapper";
import z from "zod";
import { HttpAPIRoutes } from "@/utils/http/api";
import { adminUserListResponseSchema } from "@/schemas/admin/users";

export default async function Page() {
    const res = await serverFetchWrapper<AdminUser[]>({
        url: HttpAPIRoutes.ADMIN_USERS,
        method: "GET",
        schema: adminUserListResponseSchema,
    });

    const pageRes: PageResponse<AdminUser> = {
        content: res.data,
        totalElements: res.data.length,
        totalPages: 1,
        number: 0,
        size: res.data.length,
        first: true,
        last: true,
        numberOfElements: res.data.length,
        empty: res.data.length === 0,
        sort: {
            sorted: false,
            unsorted: true,
            empty: res.data.length === 0,
        },
    };

    return (
        <AdminUsersPage
            users={pageRes}
        />
    );
}
