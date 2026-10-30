"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useQueries, useQuery } from '@tanstack/react-query';
import { CalendarDays, Megaphone, Wrench } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { ListPagination } from '@/components/common/table/ListPagination';
import { feedDate, publicationReadError, publicationReadRetry } from '@/components/pages/feed/feedDisplay';
import type { PublicationFeedItem } from '@/schemas/publications/feed';
import { listPublicationFeedAction } from '@/server/actions/publications/feed';
import { listAdminPublicationsAction } from '@/server/actions/publications/list';
import { useUserStore } from '@/stores/userStore';
import { getMediaImageUrl } from '@/utils/media/imageUrl';
import { hasPermission } from '@/utils/permission/hasPermission';
import { publicationPlainText } from '@/utils/publications/content';
import { parsePublicationPagination, PUBLICATION_PAGE_SIZES, updatePublicationPagination } from '@/utils/publications/pagination';
import { publicationStatusOptions } from '@/utils/publications/statusFilters';

const categories = [
    { type: 'EVENT', label: 'Eventos', singular: 'Evento', route: 'event', permission: 'EVENT_READ_ADMIN', icon: CalendarDays, size: 1 },
    { type: 'NOTICE', label: 'Avisos', singular: 'Aviso', route: 'notice', permission: 'NOTICE_READ', icon: Megaphone, size: 3 },
    { type: 'SERVICE', label: 'Serviços', singular: 'Serviço', route: 'service', permission: 'SERVICE_ADMIN_READ', icon: Wrench, size: 4 },
] as const;
const states = { OPEN: 'Aberto', IN_PROGRESS: 'Em andamento', FINISHED: 'Finalizado', CANCELLED: 'Cancelado' };
const editorialStates = { DRAFT: 'Rascunho', PUBLISHED: 'Publicado', ARCHIVED: 'Arquivado' };

function ImagePreview({ item, className }: { item: PublicationFeedItem; className: string }) {
    const [failed, setFailed] = useState(false);
    const Icon = categories.find(category => category.type === item.type)!.icon;
    return <div className={`relative overflow-hidden rounded-lg bg-j-gray-100 ${className}`}>
        {item.primaryImage && !failed ? <Image src={getMediaImageUrl(item.primaryImage.storageKey)} alt="" fill unoptimized sizes="(min-width: 1024px) 400px, 100vw" className="object-cover" onError={() => setFailed(true)} /> : <div className="flex h-full items-center justify-center" aria-hidden="true"><Icon className="text-j-gray-400" size={28} /></div>}
    </div>;
}

function PublicationLink({ item, canAdmin }: { item: PublicationFeedItem; canAdmin: boolean }) {
    const category = categories.find(entry => entry.type === item.type)!;
    const href = canAdmin ? `/admin/publications/${category.route}/${item.id}` : `/feed?publication=${item.id}`;
    return <Link href={href} className="cursor-pointer font-bold text-j-blue-800 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-800">{canAdmin ? 'Administrar' : 'Ver no feed'} <span className="sr-only">{item.title}</span></Link>;
}

/** O feed é uma visão paginada de publicações publicadas, não um inventário administrativo. */
export function PublicationOverview() {
    const permissions = useUserStore(state => state.permissions);
    const canFeed = hasPermission(permissions, 'PUBLICATIONS', 'FEED_READ');
    const canDetail = hasPermission(permissions, 'PUBLICATIONS', 'PUBLICATION_READ');
    const canEvents = hasPermission(permissions, 'PUBLICATIONS', 'EVENT_READ_ADMIN');
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const pagination = parsePublicationPagination(searchParams);
    const feed = useQuery({
        queryKey: ['publications', 'feed', 'overview', pagination, permissions],
        queryFn: () => listPublicationFeedAction({ page: pagination.pageIndex, size: pagination.pageSize }),
        enabled: canFeed, retry: publicationReadRetry,
    });
    const categoryQueries = useQueries({ queries: categories.map(category => ({
        queryKey: ['publications', 'feed', 'overview-category', category.type, permissions],
        queryFn: () => listPublicationFeedAction({ type: category.type, page: 0, size: category.size }),
        enabled: canFeed, retry: publicationReadRetry,
    })) });
    const adminEvents = useQuery({
        queryKey: ['publications', 'admin', 'events', 'overview', permissions],
        queryFn: () => listAdminPublicationsAction({ page: 0, size: 3 }), enabled: canEvents, retry: false,
    });
    const canAdmin = (type: PublicationFeedItem['type']) => hasPermission(permissions, 'PUBLICATIONS', categories.find(category => category.type === type)!.permission);

    return <div className="mt-5 space-y-8">
        <p className="text-sm text-j-gray-600">A visão geral mostra publicações publicadas no feed. Rascunhos e outros estados de eventos estão na administração de eventos.</p>
        {!canFeed && <p role="status" className="rounded-xl bg-j-gray-100 p-4">Você não possui permissão para consultar o feed de publicações.</p>}
        {canFeed && <>
            <section aria-label="Indicadores de publicações" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[{ label: 'Publicações publicadas', query: feed, href: '/feed' }, ...categories.map((category, i) => ({ label: `${category.label} publicados`, query: categoryQueries[i], href: hasPermission(permissions, 'PUBLICATIONS', category.permission) ? `/admin/publications/${category.route}` : undefined }))].map(({ label, query, href }) => <div key={label} className="rounded-xl border border-j-gray-200 bg-j-gray-100/40 p-4">
                    <p className="text-sm text-j-gray-600">{label}</p>
                    {query.isLoading ? <div role="status" aria-label={`Carregando ${label}`} className="mt-2 h-8 w-16 animate-pulse rounded bg-j-gray-200" /> : query.isError ? <p className="mt-2 text-sm">Indisponível</p> : <p className="mt-2 text-2xl font-bold text-j-blue-800">{query.data?.totalElements ?? 0}</p>}
                    {href && <Link href={href} className="mt-2 inline-block cursor-pointer text-xs font-bold text-j-blue-800 underline">{label === 'Publicações publicadas' ? 'Ver feed' : 'Ver área'}<span className="sr-only"> — {label}</span></Link>}
                </div>)}
            </section>
            <section aria-label="Publicações por categoria" className="grid gap-4 lg:grid-cols-2">
                {categories.map((category, index) => {
                    const query = categoryQueries[index];
                    return <section key={category.type} className={`min-w-0 rounded-xl border border-j-gray-200 p-4 ${category.type === 'EVENT' ? 'lg:row-span-2' : ''}`}>
                        <div className="flex items-center justify-between gap-3"><h3 className="font-bold text-j-blue-800">{category.type === 'EVENT' ? 'Evento publicado mais recente' : `${category.label} publicados recentes`}</h3>{hasPermission(permissions, 'PUBLICATIONS', category.permission) && <Link className="cursor-pointer text-sm font-bold text-j-blue-800 underline" href={`/admin/publications/${category.route}`}>Ver todos</Link>}</div>
                        {query.isLoading ? <div role="status" aria-label={`Carregando ${category.label}`} className="mt-3 h-32 animate-pulse rounded-lg bg-j-gray-100" /> : query.isError ? <div role="alert" className="mt-3 text-sm">{publicationReadError(query.error).message} <button type="button" className="cursor-pointer underline" onClick={() => void query.refetch()}>Tentar novamente</button></div> : !query.data?.content.length ? <p className="mt-3 text-sm text-j-gray-600">Nenhuma publicação nesta categoria.</p> : <div className="mt-3 space-y-3">{query.data.content.map(item => <article key={item.id} className={category.type === 'EVENT' ? 'space-y-3' : 'flex min-w-0 gap-3'}>
                            <ImagePreview item={item} className={category.type === 'EVENT' ? 'aspect-video w-full' : 'h-20 w-24 shrink-0'} />
                            <div className="min-w-0 space-y-1"><p className="text-xs font-semibold text-j-gray-600">{category.singular} · Publicado</p><h4 className="line-clamp-2 font-bold text-j-blue-800">{item.title}</h4><p className="line-clamp-2 text-sm text-j-gray-600">{publicationPlainText(item.content)}</p><p className="text-xs text-j-gray-600">{item.type === 'EVENT' ? `${feedDate(item.details.startsAt)} · ${states[item.details.status]}` : feedDate(item.publishedAt)}</p>{(canAdmin(item.type) || canDetail) && <PublicationLink item={item} canAdmin={canAdmin(item.type)} />}</div>
                        </article>)}</div>}
                    </section>;
                })}
            </section>
        </>}
        {canEvents && <section className="rounded-xl border border-j-gray-200 p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-bold text-j-blue-800">Eventos administrativos</h3><Link href="/admin/publications/event" className="cursor-pointer text-sm font-bold text-j-blue-800 underline">Ver todos</Link></div><p className="mt-1 text-sm text-j-gray-600">Todos os estados editoriais, incluindo rascunhos.{adminEvents.data && !adminEvents.isError && ` Total cadastrado: ${adminEvents.data.totalElements}.`}</p>
            {adminEvents.isLoading ? <div role="status" aria-label="Carregando eventos administrativos" className="mt-3 h-16 animate-pulse rounded bg-j-gray-100" /> : adminEvents.isError ? <p role="alert" className="mt-3 text-sm">Não foi possível carregar eventos. <button type="button" className="cursor-pointer underline" onClick={() => void adminEvents.refetch()}>Tentar novamente</button></p> : !adminEvents.data?.content.length ? <p className="mt-3 text-sm">Nenhum evento cadastrado.</p> : <ul className="mt-3 divide-y divide-j-gray-200">{adminEvents.data.content.map(event => <li key={event.id} className="flex flex-wrap justify-between gap-2 py-2 text-sm"><Link className="cursor-pointer font-bold text-j-blue-800 underline" href={`/admin/publications/event/${event.id}`}>{event.title}</Link><span>{editorialStates[event.publicationStatus]} · {states[event.eventStatus]}</span></li>)}</ul>}
        </section>}
        <section aria-labelledby="recent-publications"><h3 id="recent-publications" className="font-bold text-j-blue-800">Publicações recentes</h3>
            <fieldset className="mt-4" aria-describedby="publication-filters-help"><legend className="text-sm font-bold text-j-gray-700">Estado da publicação</legend><p id="publication-filters-help" className="mt-1 text-xs text-j-gray-600">Filtros administrativos ainda não implementados.</p><div className="mt-2 flex flex-wrap gap-2">{publicationStatusOptions.map(option =>
                <button key={option.value} type="button" title="Filtros ainda não implementados." onClick={() => toast('Filtros ainda não implementados.', { id: 'publication-filters-unavailable' })} className="cursor-pointer rounded-lg border border-j-gray-300 bg-j-white px-3 py-2 text-sm font-semibold text-j-gray-700 hover:bg-j-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-800">{option.label}</button>
            )}</div></fieldset>
            {canFeed && (feed.isLoading ? <div role="status" aria-label="Carregando publicações recentes" className="mt-4 h-32 animate-pulse rounded bg-j-gray-100" /> : feed.isError ? <p role="alert" className="mt-4 text-sm">{publicationReadError(feed.error).message} <button type="button" className="cursor-pointer underline" onClick={() => void feed.refetch()}>Tentar novamente</button></p> : !feed.data?.content.length ? <p className="mt-4 text-sm">Nenhuma publicação publicada encontrada.</p> : <ul className="mt-4 divide-y divide-j-gray-200">{feed.data.content.map(item => <li key={item.id} className="flex min-w-0 items-center gap-3 py-3"><ImagePreview item={item} className="h-14 w-16 shrink-0" /><div className="min-w-0 flex-1"><p className="truncate font-bold text-j-blue-800">{item.title}</p><p className="text-xs text-j-gray-600">{categories.find(entry => entry.type === item.type)!.singular} · Publicado · {feedDate(item.publishedAt)}</p></div>{(canAdmin(item.type) || canDetail) && <PublicationLink item={item} canAdmin={canAdmin(item.type)} />}</li>)}</ul>)}
            {canFeed && feed.data && <ListPagination itemLabel="publicações" isFetching={feed.isFetching} pagination={{ pageIndex: feed.data.number, pageSize: pagination.pageSize, pageCount: feed.data.totalPages, rowCount: feed.data.totalElements, pageSizeOptions: PUBLICATION_PAGE_SIZES, onChange: next => { const params = updatePublicationPagination(new URLSearchParams(searchParams.toString()), next); window.history.pushState(null, '', `${pathname}?${params}`); } }} />}
        </section>
    </div>;
}
