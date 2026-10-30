import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { EventAdminDetails } from '@/components/pages/admin/publications/EventAdminDetails';
import { publicationIdSchema } from '@/schemas/publications/admin';
import { simpleHaveRoutePermissions } from '@/utils/permission/routePermissions';

export default async function EventAdminPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!/^\d+$/.test(id) || !publicationIdSchema.safeParse(Number(id)).success) notFound();
    await simpleHaveRoutePermissions(`/admin/publications/event/${id}`);
    return <Suspense fallback={<p>Carregando evento...</p>}><EventAdminDetails id={Number(id)} /></Suspense>;
}
