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
    return (
        <AdminUsersPage
            users={res.data}
        />
    );
}
