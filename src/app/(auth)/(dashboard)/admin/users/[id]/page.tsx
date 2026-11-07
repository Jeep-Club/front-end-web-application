import { AdminUserDetailsLoader } from "@/components/pages/admin/users/[id]/UserDetails";

interface Props {
    params: Promise<{
        id: string;
    }>;
}

export default async function Page({ params }: Props) {
    const { id } = await params;


    if (!/^\d+$/.test(id)) return null;
    return <AdminUserDetailsLoader userId={Number(id)} />;
}
