"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/common/button";
import { feedDate } from "@/components/pages/feed/feedDisplay";
import { publicationPlainText } from "@/utils/publications/content";
import { ArrowDown, ArrowUp, CalendarDays, Megaphone, Newspaper, Wrench, List, LayoutGrid } from "lucide-react";
import { ListPagination } from "@/components/common/table/ListPagination";
import { getMediaImageUrl } from "@/utils/media/imageUrl";
import { PUBLICATION_PAGE_SIZES } from "@/utils/publications/pagination";

export interface PublicationListItem {
    id: number;
    type: "NOTICE" | "EVENT" | "SERVICE";
    title: string;
    content: string;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "PENDING";
    serviceRequest?: boolean;
    publishedAt?: string;
    startsAt?: string;
    eventStatus?: "OPEN" | "IN_PROGRESS" | "FINISHED" | "CANCELLED";
    images: { storageKey: string; position: number; primary: boolean }[];
}

interface PublicationListProps {
    page?: PageResponse<PublicationListItem>;
    pageIndex: number;
    pageSize: number;
    onPaginationChange: (next: { pageIndex: number; pageSize: number }) => void;
    isLoading?: boolean;
    isFetching?: boolean;
    error?: string;
    onRetry?: () => void;
    canManage?: boolean;
    canViewFeed?: boolean;
    view?: "list" | "grid";
    onViewChange?: (view: "list" | "grid") => void;
    ordering?: { direction: 'asc' | 'desc'; title: string; onChange?: (direction: 'asc' | 'desc') => void };
    emptyDescription?: string;
}

const types = {
    NOTICE: { label: "Aviso", icon: Megaphone },
    EVENT: { label: "Evento", icon: CalendarDays },
    SERVICE: { label: "Serviço", icon: Wrench },
};
const CARD_TITLE_LIMIT = 80;
const CARD_CONTENT_LIMIT = 180;

function previewText(text: string, limit: number) {
    const characters = Array.from(text.replace(/\s+/g, " ").trim());
    return characters.length > limit ? `${characters.slice(0, limit - 1).join("").trimEnd()}…` : characters.join("");
}
const statuses = { DRAFT: "Rascunho", PUBLISHED: "Publicado", ARCHIVED: "Arquivado", PENDING: "Solicitação pendente" };
const statusColors = {
    DRAFT: "bg-gray-100 text-gray-700",
    PUBLISHED: "bg-blue-100 text-blue-800",
    ARCHIVED: "bg-j-gray-100 text-j-gray-600",
    PENDING: "bg-gray-100 text-gray-700",
};

const eventStates = { OPEN: "Aberto", IN_PROGRESS: "Em andamento", FINISHED: "Finalizado", CANCELLED: "Cancelado" };

function PublicationImage({ item, view }: { item: PublicationListItem; view: 'list' | 'grid' }) {
    const cover = item.images.find(image => image.primary);
    const [failed, setFailed] = useState(false);
    const Icon = types[item.type].icon;
    return <div className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-j-gray-100 ${view === 'list' ? 'h-16 w-16 sm:h-20 sm:w-24' : 'aspect-[16/7] w-full rounded-b-none'}`}>
        {cover && !failed ? <Image src={getMediaImageUrl(cover.storageKey)} alt="" fill unoptimized sizes={view === 'list' ? '96px' : '(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw'} className="object-cover" onError={() => setFailed(true)} /> : <Icon size={24} className="text-j-gray-400" aria-hidden="true" />}
    </div>;
}

/** Uma página real da API, em lista compacta ou grade, sem filtrar resultados incompletos. */
export function PublicationList({ page, pageIndex, pageSize, onPaginationChange, isLoading = false, isFetching = false, error, onRetry, canManage = true, canViewFeed = false, view = 'list', onViewChange, ordering, emptyDescription }: PublicationListProps) {
    return (
        <section aria-label="Resultados de publicações" className="mt-5 border-t border-j-gray-200 pt-4" aria-busy={isLoading || isFetching}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div><h3 className="font-bold text-j-blue-800">Publicações</h3>{page && !error && <p className="text-sm text-j-gray-600">{page.totalElements.toLocaleString('pt-BR')} resultados</p>}</div>
                <div className="flex flex-wrap items-center gap-2">
                    {ordering && <button type="button" title={ordering.title} aria-label={ordering.title} aria-disabled={!ordering.onChange} onClick={() => ordering.onChange?.(ordering.direction === 'desc' ? 'asc' : 'desc')} className="inline-flex cursor-pointer items-center gap-1 self-stretch rounded-lg border border-j-gray-300 px-3 py-2 text-sm font-semibold text-j-gray-700 hover:bg-j-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-70">{ordering.direction === 'desc' ? <ArrowDown size={16} aria-hidden="true" /> : <ArrowUp size={16} aria-hidden="true" />}{ordering.direction === 'desc' ? 'Mais recentes' : 'Mais antigas'}</button>}
                    {onViewChange && <div role="group" aria-label="Visualização dos resultados" className="flex gap-2">{([{ value: 'list', label: 'Lista', icon: List }, { value: 'grid', label: 'Grade', icon: LayoutGrid }] as const).map(mode => <Button key={mode.value} aria-pressed={view === mode.value} onClick={() => onViewChange(mode.value)} className={view === mode.value ? '' : 'border border-j-gray-300 bg-j-white text-j-gray-700 hover:bg-j-gray-100 hover:text-j-gray-700 focus-visible:bg-j-gray-100 focus-visible:text-j-gray-700'}><mode.icon size={16} aria-hidden="true" />{mode.label}</Button>)}</div>}
                </div>
            </div>
            {isLoading ? (
                <div role="status" aria-label="Carregando publicações" className={view === 'grid' ? 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}>
                    {Array.from({ length: Math.min(pageSize, 6) }, (_, index) => <div key={index} className={`${view === 'grid' ? 'h-56' : 'h-24'} animate-pulse rounded-xl bg-j-gray-100`} />)}
                </div>
            ) : error ? (
                <div role="alert" className="rounded-xl border border-j-red-200 bg-j-red-100 p-5 text-sm text-input-error-text">{error}{onRetry && <button type="button" onClick={onRetry} className="ml-3 cursor-pointer underline">Tentar novamente</button>}</div>
            ) : page?.content.length ? (
                <div className={view === 'grid' ? 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3' : 'divide-y divide-j-gray-200'}>
                    {page.content.map(item => {
                        const { label, icon: TypeIcon } = types[item.type];
                        return <article key={`${item.type}-${item.serviceRequest ? 'request' : 'publication'}-${item.id}`} className={view === 'grid' ? 'flex min-w-0 flex-col overflow-hidden rounded-xl border border-j-gray-200 bg-j-white' : 'flex min-w-0 flex-wrap items-center gap-3 py-3'}>
                            <PublicationImage key={item.images.find(image => image.primary)?.storageKey ?? 'placeholder'} item={item} view={view} />
                            <div className={view === 'grid' ? 'min-w-0 space-y-2 p-3' : 'min-w-0 flex-1 space-y-1'}>
                                <h3 title={item.title} className="line-clamp-2 break-words font-bold text-j-blue-800">{previewText(item.title, CARD_TITLE_LIMIT)}</h3>
                                <p className="flex flex-wrap items-center gap-2 text-xs text-j-gray-600"><span>ID #{item.id}</span><span className="inline-flex items-center gap-1"><TypeIcon size={13} aria-hidden="true" />{label}</span></p>
                                <div className="flex flex-wrap gap-2 text-xs font-semibold"><span className={`rounded px-2 py-1 ${statusColors[item.status]}`}>{statuses[item.status]}</span>{item.eventStatus && <span className="rounded bg-j-gray-100 px-2 py-1 text-j-gray-700">{eventStates[item.eventStatus]}</span>}</div>
                                {(item.startsAt || item.publishedAt) && <p className="text-xs text-j-gray-600">{item.startsAt ? 'Início: ' : 'Publicado em: '}{feedDate((item.startsAt ?? item.publishedAt)!)}</p>}
                                {view === 'grid' && <p className="line-clamp-2 break-words text-sm text-j-gray-600">{previewText(publicationPlainText(item.content), CARD_CONTENT_LIMIT)}</p>}
                            </div>
                            {(canManage || canViewFeed) && <Link className={`${view === 'grid' ? 'm-3 mt-auto' : 'w-full text-right sm:w-auto'} cursor-pointer text-sm font-bold text-j-blue-800 underline focus-visible:outline-2 focus-visible:outline-offset-2`} href={canManage ? `/admin/publications/${item.type === 'EVENT' ? 'event' : item.type === 'NOTICE' ? 'notice' : 'service'}/${item.id}?${new URLSearchParams({ page: String(pageIndex), size: String(pageSize) })}` : `/feed?publication=${item.id}`}>{canManage ? `Administrar ${label.toLocaleLowerCase('pt-BR')}` : 'Ver no feed'}</Link>}
                        </article>;
                    })}
                </div>
            ) : (
                <div role="status" className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-j-gray-300 bg-j-gray-100/40 p-4 text-center">
                    <Newspaper size={24} aria-hidden="true" className="text-j-gray-400" />
                    <h3 className="mt-2 text-base font-bold text-j-blue-800">Nenhuma publicação encontrada</h3>
                    <p className="mt-1 text-sm text-j-gray-500">{emptyDescription ?? 'Não há publicações disponíveis nesta categoria.'}</p>
                </div>
            )}
            <div className="mt-4 border-t border-j-gray-200">
                <ListPagination itemLabel="publicações" isFetching={isLoading || isFetching || !!error} pagination={{ pageIndex: page?.number ?? pageIndex, pageSize, pageCount: page?.totalPages ?? 0, rowCount: page?.totalElements, pageSizeOptions: PUBLICATION_PAGE_SIZES, onChange: onPaginationChange }} />
            </div>
        </section>
    );
}
