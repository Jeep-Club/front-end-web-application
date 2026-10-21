"use client";

import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Megaphone, Newspaper, RefreshCw, Wrench } from "lucide-react";
import { Button } from "@/components/common/button";
import { ListPagination } from "@/components/common/table/ListPagination";
import { listPublicationFeedAction } from "@/actions/publications/feed";
import { feedTypeSchema } from "@/schemas/publications/feed";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import { useModal } from "@/providers/ModalProvider";
import { getMediaImageUrl } from "@/utils/media/imageUrl";
import { publicationPlainText } from "@/utils/publications/content";
import { parsePublicationPagination, updatePublicationPagination, PUBLICATION_PAGE_SIZES } from "@/utils/publications/pagination";
import { PublicationDetailModal } from "./PublicationDetailModal";
import { FeedInteractions } from "./FeedInteractions";
import { FeedMetadata } from "./FeedMetadata";
import { feedDate, feedTypes } from "./feedDisplay";

const icons = { NOTICE: Megaphone, EVENT: CalendarDays, SERVICE: Wrench };
function preview(value: string, max: number) {
    const text = Array.from(value);
    return text.length > max ? `${text.slice(0, max - 1).join("")}…` : value;
}

export default function Feed() {
    const permissions = useUserStore((state) => state.permissions);
    const canRead = hasPermission(permissions, "PUBLICATIONS", "FEED_READ");
    const canDetail = hasPermission(permissions, "PUBLICATIONS", "PUBLICATION_READ");
    const { setContent, setOpen } = useModal();
    const pathname = usePathname();
    const params = useSearchParams();
    const typeResult = feedTypeSchema.safeParse(params.get("type"));
    const type = typeResult.success ? typeResult.data : undefined;
    const pagination = parsePublicationPagination(params);
    const query = useQuery({ queryKey: ["publications", "feed", type, pagination.pageIndex, pagination.pageSize, permissions], queryFn: () => listPublicationFeedAction({ type, page: pagination.pageIndex, size: pagination.pageSize }), enabled: canRead });
    function openPublication(id: number) { setContent(<PublicationDetailModal publicationId={id} />); setOpen(); }
    function filterType(next?: string) {
        const search = new URLSearchParams(params.toString());
        if (next) search.set("type", next); else search.delete("type");
        search.delete("page");
        window.history.replaceState(null, "", `${pathname}${search.size ? `?${search}` : ""}`);
    }
    return <div className="min-h-full w-full p-3 pb-[calc(6rem+env(safe-area-inset-bottom))] md:p-4">
        <div className="flex w-full flex-col gap-6">
            <h1 className="text-xl font-extrabold text-j-gray-700 md:text-2xl">Home</h1>
            {!canRead ? <div role="status" className="rounded-2xl border border-j-gray-200 bg-j-white p-6 text-sm text-j-gray-600">Seu usuário não possui permissão para acessar o feed.</div> : <>
                <section className="rounded-2xl border border-j-gray-200 bg-j-white p-4 md:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4"><h2 className="text-lg font-extrabold text-j-blue-800">Publicações do clube</h2>
                        <Button aria-label="Atualizar feed" disabled={query.isFetching} onClick={() => void query.refetch()} className="border border-j-gray-200 bg-j-white text-j-gray-600 hover:bg-j-gray-100 hover:text-j-blue-800"><RefreshCw size={16} className={query.isFetching ? "animate-spin" : ""} />Atualizar</Button>
                    </div>
                    <nav aria-label="Tipos de publicação" className="fixed inset-x-0 bottom-0 z-20 grid w-full grid-cols-4 gap-1 border-t border-j-gray-200 bg-j-white px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] md:static md:mt-4 md:gap-2 md:border-0 md:bg-transparent md:p-0 md:shadow-none">
                        <button type="button" onClick={() => filterType()} aria-pressed={!type} className={`flex min-h-14 w-full min-w-0 flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2 text-[11px] font-semibold focus-visible:outline-2 focus-visible:outline-j-blue-800 md:min-h-11 md:flex-row md:gap-2 md:rounded-lg md:px-4 md:text-sm ${!type ? "border-j-blue-800 bg-j-blue-800 text-j-white" : "border-j-gray-200 text-j-gray-600 hover:bg-j-gray-100"}`}><Newspaper size={20} aria-hidden="true" className="shrink-0 md:size-4" />Todos</button>
                        {(["NOTICE", "EVENT", "SERVICE"] as const).map((key) => { const Icon = icons[key]; return <button key={key} type="button" onClick={() => filterType(key)} aria-pressed={type === key} className={`flex min-h-14 w-full min-w-0 flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2 text-[11px] font-semibold focus-visible:outline-2 focus-visible:outline-j-blue-800 md:min-h-11 md:flex-row md:gap-2 md:rounded-lg md:px-4 md:text-sm ${type === key ? "border-j-blue-800 bg-j-blue-800 text-j-white" : "border-j-gray-200 text-j-gray-600 hover:bg-j-gray-100"}`}><Icon size={20} aria-hidden="true" className="shrink-0 md:size-4" />{feedTypes[key].plural}</button>; })}
                    </nav>
                </section>
                {query.isLoading ? <div role="status" aria-label="Carregando feed" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: pagination.pageSize }, (_, index) => <div key={index} className="h-80 animate-pulse rounded-2xl bg-j-gray-200" />)}</div>
                    : query.isError ? <div role="alert" className="rounded-2xl border border-red-200 bg-j-white p-6"><p className="text-sm text-red-500">{query.error.message}</p><Button className="mt-4" onClick={() => void query.refetch()}>Tentar novamente</Button></div>
                    : !query.data?.content.length ? <div role="status" className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-j-gray-300 bg-j-white p-6 text-center"><Newspaper size={36} className="text-j-gray-400" aria-hidden="true" /><h2 className="mt-4 font-bold text-j-blue-800">Nenhuma publicação por aqui</h2><p className="mt-2 text-sm text-j-gray-500">Os avisos, eventos e serviços aparecem aqui depois de publicados.</p>{pagination.pageIndex > 0 && <Button className="mt-4" onClick={() => { const search = new URLSearchParams(params.toString()); search.delete("page"); window.history.replaceState(null, "", `${pathname}?${search}`); }}>Voltar à primeira página</Button>}</div>
                    : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{query.data.content.map((publication) => {
                        const Icon = icons[publication.type];
                        return <article key={publication.id} className="flex flex-col overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm">
                            {publication.primaryImage && <div className="relative aspect-video bg-j-gray-100"><Image src={getMediaImageUrl(publication.primaryImage.storageKey)} alt={publication.title} fill unoptimized sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" /></div>}
                            <div className="flex flex-1 flex-col gap-4 p-5">
                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs"><span className="inline-flex items-center gap-1.5 font-bold text-j-blue-800"><Icon size={16} aria-hidden="true" />{feedTypes[publication.type].label}</span><time dateTime={publication.publishedAt} className="text-j-gray-500">{feedDate(publication.publishedAt)}</time></div>
                                <h2 className="line-clamp-2 break-words text-lg font-extrabold text-j-blue-800">{preview(publication.title, 80)}</h2>
                                <p className="line-clamp-3 break-words text-sm leading-relaxed text-j-gray-600">{preview(publicationPlainText(publication.content), 180)}</p>
                                <FeedMetadata publication={publication} />
                                {canDetail && <button type="button" onClick={() => openPublication(publication.id)} className="self-start rounded text-sm font-bold text-j-blue-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-j-blue-800">Ler publicação completa</button>}
                                <div className="mt-auto border-t border-j-gray-200 pt-3"><FeedInteractions publication={publication} onComments={canDetail ? () => openPublication(publication.id) : undefined} /></div>
                            </div>
                        </article>;
                    })}</div>}
                {query.data && !query.isError && <div className="rounded-2xl border border-j-gray-200 bg-j-white px-4 pb-4 md:px-6"><ListPagination itemLabel="publicações" isFetching={query.isFetching} pagination={{ pageIndex: query.data.number, pageSize: pagination.pageSize, pageCount: query.data.totalPages, rowCount: query.data.totalElements, pageSizeOptions: PUBLICATION_PAGE_SIZES, onChange: (next) => { const search = updatePublicationPagination(new URLSearchParams(params.toString()), next); window.history.replaceState(null, "", `${pathname}?${search}`); } }} /></div>}
            </>}
        </div>
    </div>;
}