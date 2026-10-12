import { AdminUserDetailsLoader } from "@/components/pages/admin/users/[id]/UserDetails";

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

    return <AdminUserDetailsLoader userId={Number(id)} modal />;
}
