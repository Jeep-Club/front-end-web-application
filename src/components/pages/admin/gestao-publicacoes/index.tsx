"use client";
import { Button } from '@/components/common/button';
import { PageHeader } from '@/components/common/page-header';
import { publicationReadError, publicationReadRetry } from '@/components/pages/feed/feedDisplay';
import { publicationCreationTypes } from '@/config/publicationCreation';
import { publicationManagementSections } from '@/config/publicationManagement';
import { useModal } from '@/providers/ModalProvider';
import { listAdminPublicationsAction } from '@/server/actions/publications/list';
import { listPublicationFeedAction } from '@/server/actions/publications/feed';
import { useUserStore } from '@/stores/userStore';
import { hasPermission } from '@/utils/permission/hasPermission';
import { parsePublicationPagination, updatePublicationPagination } from '@/utils/publications/pagination';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { CreatePublicationModal } from './CreatePublicationModal';
import { PublicationList } from './PublicationList';
import { PublicationOverview } from './PublicationOverview';
import { PublicationSearchFilters } from './PublicationSearchFilters';
import { publicationFeedFiltersSchema } from '@/schemas/publications/feed';

export default function PublicationManagement({ type = '' }: { type?: 'EVENT' | 'NOTICE' | 'SERVICE' | '' }) {
    const permissions = useUserStore(state => state.permissions);
    const { setContent, setOpen } = useModal();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pagination = parsePublicationPagination(searchParams);
    const requestedSort = searchParams.get('sort');
    const sort = requestedSort === 'createdAt,asc' ? 'createdAt,asc' : 'createdAt,desc';
    const view = searchParams.get('view') === 'grid' ? 'grid' : 'list';
    const publishedFrom = searchParams.get('publishedFrom') || undefined;
    const publishedTo = searchParams.get('publishedTo') || undefined;
    const period = publicationFeedFiltersSchema.safeParse({ publishedFrom, publishedTo });
    function navigateParams(params: URLSearchParams) { window.history.pushState(null, '', `${pathname}?${params}`); }
    function changePage(next: { pageIndex: number; pageSize: number }) { navigateParams(updatePublicationPagination(new URLSearchParams(searchParams.toString()), next)); }
    function changeView(next: 'list' | 'grid') { const params = new URLSearchParams(searchParams.toString()); params.set('view', next); navigateParams(params); }
    function changeOrder(next: 'asc' | 'desc') { const params = new URLSearchParams(searchParams.toString()); params.set('sort', `createdAt,${next}`); params.set('page', '0'); navigateParams(params); }
    const can = (action: string) => hasPermission(permissions, 'PUBLICATIONS', action);
    const sections = publicationManagementSections.filter(section => section.readActions.some(can) || publicationCreationTypes.some(entry => entry.type === section.type && can(entry.action)));
    const canCreate = publicationCreationTypes.some(entry => (!type || entry.type === type) && can(entry.action));
    const events = useQuery({
        queryKey: ['publications', 'admin', 'events', 'list', pagination, sort, permissions],
        queryFn: () => listAdminPublicationsAction({ page: pagination.pageIndex, size: pagination.pageSize, sort }),
        enabled: type === 'EVENT' && can('EVENT_READ_ADMIN'), refetchOnWindowFocus: false,
    });
    const isLookup = type === 'NOTICE' || type === 'SERVICE';
    const canLookup = can(type === 'EVENT' ? 'EVENT_READ_ADMIN' : type === 'NOTICE' ? 'NOTICE_READ' : 'SERVICE_ADMIN_READ');
    const canFeed = can('FEED_READ');
    const published = useQuery({
        queryKey: ['publications', 'feed', 'admin-category', type, pagination, publishedFrom, publishedTo, permissions],
        queryFn: () => listPublicationFeedAction({ type: type as 'NOTICE' | 'SERVICE', publishedFrom, publishedTo, page: pagination.pageIndex, size: pagination.pageSize }),
        enabled: isLookup && canFeed && period.success, retry: publicationReadRetry,
    });
    function selectType(next: string) {
        const section = publicationManagementSections.find(section => section.type === next);
        router.push(section ? `/admin/publications/${section.route}` : '/admin/publications');
    }
    return <div className="flex min-w-0 flex-col gap-5 p-3 md:p-4">
        <PageHeader title="Gestão de publicações" breadcrumbs={[{ label: 'Home', href: '/feed' }, { label: 'Gestão Administrativa', href: '/admin' }, ...(type ? [{ label: 'Publicações', href: '/admin/publications' }, { label: publicationManagementSections.find(section => section.type === type)!.title }] : [{ label: 'Publicações' }])]} />
        <nav aria-label="Áreas de publicações" className="flex flex-wrap gap-2">
            {[{ type: '', title: 'Visão geral' }, ...sections].map(section => <Button key={section.type} aria-pressed={type === section.type} onClick={() => selectType(section.type)} className={type === section.type ? 'bg-button-primary-bg text-button-primary-text hover:bg-button-primary-bg-hover hover:text-button-primary-text focus-visible:text-button-primary-text' : 'border border-j-gray-300 bg-j-white text-j-gray-700 hover:bg-j-gray-100 hover:text-j-gray-700 focus-visible:bg-j-gray-100 focus-visible:text-j-gray-700'}>{section.title}</Button>)}
        </nav>
        <section className="min-w-0 rounded-xl border border-j-gray-200 bg-j-white p-4 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold text-j-blue-800">{sections.find(section => section.type === type)?.title ?? 'Visão geral'}</h2>
                {canCreate && <Button onClick={() => { setContent(<CreatePublicationModal initialType={publicationCreationTypes.some(entry => entry.type === type && can(entry.action)) ? type as 'EVENT' | 'NOTICE' | 'SERVICE' : undefined} />); setOpen(); }}>Criar publicação</Button>}
            </div>
            {!type && <PublicationOverview />}
            {type && <PublicationSearchFilters key={type} type={type} canReadId={canLookup} canReadList={type === 'EVENT' ? canLookup : canFeed} publishedFrom={publishedFrom} publishedTo={publishedTo} onOpenId={id => router.push(`${pathname}/${id}`)} onPeriod={next => {
                const params = new URLSearchParams(searchParams.toString());
                for (const key of ['publishedFrom', 'publishedTo'] as const) { if (next[key]) params.set(key, next[key]!); else params.delete(key); }
                params.set('page', '0'); navigateParams(params);
            }} onClear={() => { const params = new URLSearchParams(searchParams.toString()); for (const key of ['publishedFrom', 'publishedTo', 'status', 'q']) params.delete(key); params.set('page', '0'); navigateParams(params); }} />}
            {type === 'EVENT' && (canLookup ? <PublicationList page={events.data ? { ...events.data, content: events.data.content.map(event => ({ ...event, type: 'EVENT' as const, status: event.publicationStatus })) } : undefined} pageIndex={pagination.pageIndex} pageSize={pagination.pageSize} view={view} onViewChange={changeView} ordering={{ direction: sort === 'createdAt,asc' ? 'asc' : 'desc', title: `Ordenado pela data de criação, ${sort === 'createdAt,asc' ? 'mais antigas' : 'mais recentes'} primeiro. Clique para inverter.`, onChange: changeOrder }} isLoading={events.isLoading} isFetching={events.isFetching} error={events.error?.message} onRetry={() => void events.refetch()} onPaginationChange={changePage} /> : <p className="mt-4">Você pode criar eventos, mas não possui permissão para consultar a lista.</p>)}
            {isLookup && <div className="mt-4 space-y-4"><p className="text-sm text-j-gray-600">Exibindo publicações disponíveis no feed. Outros registros podem ser consultados pelo ID.</p>
                {canFeed ? <PublicationList page={published.isError || !period.success ? undefined : published.data ? { ...published.data, content: published.data.content.map(item => ({ ...item, status: 'PUBLISHED' as const, images: item.primaryImage ? [item.primaryImage] : [] })) } : undefined} pageIndex={pagination.pageIndex} pageSize={pagination.pageSize} view={view} onViewChange={changeView} ordering={{ direction: 'desc', title: 'Ordenado pela data de publicação, mais recentes primeiro. A API ainda não permite inverter a ordem.' }} emptyDescription={publishedFrom || publishedTo ? 'Nenhuma publicação no período selecionado. Ajuste o período ou limpe os filtros.' : undefined} isLoading={published.isLoading} isFetching={published.isFetching} error={!period.success ? 'Período inválido. Revise os filtros de publicação.' : published.isError ? publicationReadError(published.error).message : undefined} onRetry={() => void published.refetch()} canManage={canLookup} canViewFeed={can('PUBLICATION_READ')} onPaginationChange={changePage} /> : <p role="status">Você não possui permissão para consultar as publicações do feed.</p>}
            </div>}
        </section>
    </div>;
}
