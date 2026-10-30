import { notFound } from 'next/navigation';
import { ServiceAdminDetails } from '@/components/pages/admin/gestao-publicacoes/ServiceAdminDetails';
import { publicationIdSchema } from '@/schemas/publications/admin';
import { simpleHaveRoutePermissions } from '@/utils/permission/routePermissions';
export default async function ServiceAdminPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!/^\d+$/.test(id) || !publicationIdSchema.safeParse(Number(id)).success) notFound();
    await simpleHaveRoutePermissions(`/admin/publications/service/${id}`);
    return <ServiceAdminDetails id={Number(id)} />;
}
