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

    const res = await serverFetchWrapper<AdminUser>({
        url: `${HttpAPIRoutes.ADMIN_USERS}/${id}`,
        method: "GET",
        schema: adminUserSchema,
    });

    return <AdminUserDetailsPage user={res.data} modal={false} />;
}