import { AdminUserDetailsPage } from "@/components/pages/admin/users/[id]/UserDetails";
import { adminUserSchema } from "@/schemas/admin/users";
import serverFetchWrapper from "@/services/fetchWrapper/serverFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

interface Props {
    params: Promise<{
        id: string;
    }>;
}

export default async function Page({ params }: Props) {
    const { id } = await params;

    // The intercepted dynamic route also matches the sibling /new route during client navigation.
    // Let the regular create-user page render instead of trying to fetch a user with id "new".
    if (!/^\d+$/.test(id)) return null;

    const user = await serverFetchWrapper<AdminUser>({
            url: `${HttpAPIRoutes.ADMIN_USERS}/${id}`,
            method: "GET",
            schema: adminUserSchema,
        });

    return <AdminUserDetailsPage user={user.data} modal={true} />;
}
