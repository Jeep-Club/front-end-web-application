import AdminUsersPage from "@/components/pages/admin/users";
import serverFetchWrapper from "@/services/fetchWrapper/serverFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { adminUserListResponseSchema } from "@/schemas/admin/users";
import { parseAdminUserSearchParams } from "@/utils/searchParam/admin/user";

interface Props {
    searchParams: Promise<AdminUserSearchParams>
}

export default async function Page({ searchParams }: Props) {
    const rawSearchParams = await searchParams;

    const validSearchParams =
        parseAdminUserSearchParams(rawSearchParams);

    const query = new URLSearchParams(validSearchParams);


    const res = await serverFetchWrapper<PageResponse<AdminUser>>({
        url: HttpAPIRoutes.ADMIN_USERS + `?${query.toString()}`,
        method: "GET",
        schema: adminUserListResponseSchema,
    });


    return (
        <AdminUsersPage
            users={res.data}
        />
    );
}
