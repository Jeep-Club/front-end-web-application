"use client";

import Image from "next/image";
import { DraftPublicationCardActions } from "./DraftPublicationCardActions";
import { PublishedPublicationCardActions } from "./PublishedPublicationCardActions";
import { publicationPlainText } from "@/utils/publications/content";
import { CalendarDays, Megaphone, Newspaper, Wrench } from "lucide-react";
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
const statuses = { DRAFT: "Rascunho", PUBLISHED: "Publicado", ARCHIVED: "Arquivado", PENDING: "Aguardando aprovação" };
const statusColors = {
    DRAFT: "bg-gray-100 text-gray-700",
    PUBLISHED: "bg-blue-100 text-blue-800",
    ARCHIVED: "bg-j-gray-100 text-j-gray-600",
    PENDING: "bg-amber-100 text-amber-900",
};

/** Recebe uma página da API sem acoplar a apresentação a um endpoint específico. */
export function PublicationList({ page, pageIndex, pageSize, onPaginationChange, isLoading = false, isFetching = false, error }: PublicationListProps) {
    return (
        <div className="mt-5 border-t border-j-gray-200 pt-5" aria-busy={isLoading || isFetching}>
            {isLoading ? (
                <div role="status" aria-label="Carregando publicações" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: pageSize }, (_, index) => <div key={index} className="h-64 animate-pulse rounded-2xl bg-j-gray-100" />)}
                </div>
            ) : error ? (
                <p role="alert" className="rounded-xl border border-j-red-200 bg-j-red-100 p-5 text-sm text-j-red-500">{error}</p>
            ) : page?.content.length ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {page.content.map((item) => {
                        const cover = item.images.find((image) => image.primary);
                        const { label, icon: TypeIcon } = types[item.type];
                        return (
                            <article key={`${item.type}-${item.serviceRequest ? 'request' : 'publication'}-${item.id}`} className="flex flex-col overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white">
                                {cover && <div className="relative aspect-video bg-j-gray-100"><Image src={getMediaImageUrl(cover.storageKey)} alt={item.title} fill unoptimized sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" /></div>}
                                <div className="flex flex-col gap-3 p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
                                        <span className="inline-flex items-center gap-1.5 text-j-blue-800"><TypeIcon size={16} aria-hidden="true" className="shrink-0" />{label}</span>
                                        <span className={`rounded-full px-2.5 py-1 ${statusColors[item.status]}`}>{statuses[item.status]}</span>
                                    </div>
                                    <h3 title={item.title} className="line-clamp-2 break-words font-bold text-j-blue-800">{previewText(item.title, CARD_TITLE_LIMIT)}</h3>
                                    <p className="line-clamp-3 break-words text-sm text-j-gray-600">{previewText(publicationPlainText(item.content), CARD_CONTENT_LIMIT)}</p>
                                    {item.serviceRequest && <p className="text-sm text-amber-900">Solicitação recebida. O serviço aparecerá no feed após aprovação.</p>}
                                </div>
                                <DraftPublicationCardActions publication={item} />
                                <PublishedPublicationCardActions publication={item} />
                            </article>
                        );
                    })}
                </div>
            ) : (
                <div role="status" className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-j-gray-300 bg-j-gray-100/40 p-6 text-center">
                    <Newspaper size={32} aria-hidden="true" className="text-j-gray-400" />
                    <h3 className="mt-3 text-base font-bold text-j-blue-800">{page ? "Nenhuma publicação encontrada" : "Sua lista de publicações"}</h3>
                    <p className="mt-2 max-w-md text-sm text-j-gray-500">{page ? "Não há publicações para os tipos selecionados." : "A listagem estará disponível em breve. Você já pode escolher os tipos e a quantidade por página."}</p>
                </div>
            )}
            <div className="mt-4 border-t border-j-gray-200">
                <ListPagination itemLabel="publicações" isFetching={isLoading || isFetching || !!error} pagination={{
                    pageIndex: page?.number ?? pageIndex,
                    pageSize,
                    pageCount: page?.totalPages ?? 0,
                    rowCount: page?.totalElements,
                    pageSizeOptions: PUBLICATION_PAGE_SIZES,
                    onChange: onPaginationChange,
                }} />
            </div>
        </div>
    );
}
