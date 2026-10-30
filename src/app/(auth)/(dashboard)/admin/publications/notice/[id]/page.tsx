import { notFound } from 'next/navigation';
import { NoticeAdminDetails } from '@/components/pages/admin/gestao-publicacoes/NoticeAdminDetails';
import { publicationIdSchema } from '@/schemas/publications/admin';
import { simpleHaveRoutePermissions } from '@/utils/permission/routePermissions';
export default async function NoticeAdminPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!/^\d+$/.test(id) || !publicationIdSchema.safeParse(Number(id)).success) notFound();
    await simpleHaveRoutePermissions(`/admin/publications/notice/${id}`);
    return <NoticeAdminDetails id={Number(id)} />;
}
