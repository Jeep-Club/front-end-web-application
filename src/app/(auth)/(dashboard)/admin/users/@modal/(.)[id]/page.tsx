import { AdminUserDetailsPage } from "@/components/pages/admin/users/[id]/UserDetails";
import { adminUserSchema } from "@/schemas/admin/users";
import { roleListResponseSchema } from "@/schemas/authorization/list";
import serverFetchWrapper from "@/services/fetchWrapper/serverFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

interface Props {
    params: Promise<{
        id: string;
    }>;
}

export default async function Page({ params }: Props) {
    const { id } = await params;

    const [user, roles] = await Promise.all([serverFetchWrapper<AdminUser>({
            url: `${HttpAPIRoutes.ADMIN_USERS}/${id}`,
            method: "GET",
            schema: adminUserSchema,
        }), serverFetchWrapper<RoleListResponse>({
            url: HttpAPIRoutes.USER_ROLES.replace("{id}", id),
            method: "GET",
            schema: roleListResponseSchema,
        })]);

    return <AdminUserDetailsPage user={user.data} roles={roles.data} modal={true} />;
}