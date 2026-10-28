"use client";

import { Button } from "@/components/common/button";
import { useModal } from "@/providers/ModalProvider";
import { feedTypeSchema } from "@/schemas/publications/feed";
import { listPublicationFeedAction } from "@/server/actions/publications/feed";
import { useUserStore } from "@/stores/userStore";
import { getMediaImageUrl } from "@/utils/media/imageUrl";
import { hasPermission } from "@/utils/permission/hasPermission";
import { publicationPlainText } from "@/utils/publications/content";
import { mergeFeedPages,nextFeedPage } from "@/utils/publications/infiniteFeed";
import { useInfiniteQuery } from "@tanstack/react-query";
import { CalendarDays,Megaphone,Newspaper,Wrench } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect,useRef } from "react";
import { feedTypes } from "./feedDisplay";
import { FeedInteractions } from "./FeedInteractions";
import { FeedMetadata } from "./FeedMetadata";
import { PublicationCommentPreview } from "./PublicationCommentPreview";
import { PublicationDetailModal } from "./PublicationDetailModal";
import { RelativeTime } from "./RelativeTime";

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
    const params = useSearchParams();
    const typeResult = feedTypeSchema.safeParse(params.get("type"));
    const type = typeResult.success ? typeResult.data : undefined;
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const query = useInfiniteQuery({
        queryKey: ["publications", "feed", "infinite", type, permissions],
        queryFn: ({ pageParam }) => listPublicationFeedAction({ type, page: pageParam, size: 12 }),
        initialPageParam: 0,
        getNextPageParam: nextFeedPage,
        enabled: canRead,
    });
    const publications = mergeFeedPages(query.data?.pages ?? []);
    const { fetchNextPage, hasNextPage, isFetching, isFetchNextPageError } = query;
    const pageCount = query.data?.pages.length ?? 0;
    useEffect(() => {
        const sentinel = loadMoreRef.current;
        if (!sentinel || !canRead || !hasNextPage || isFetching || isFetchNextPageError) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                observer.disconnect();
                void fetchNextPage({ cancelRefetch: false });
            }
        }, { root: sentinel.closest("[data-dashboard-scroll]"), rootMargin: "300px 0px" });
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [canRead, hasNextPage, isFetching, isFetchNextPageError, fetchNextPage, pageCount]);
    function openPublication(id: number) { setContent(<PublicationDetailModal publicationId={id} />); setOpen(); }
    function filterType(next?: 'NOTICE' | 'EVENT' | 'SERVICE') {
        const search = new URLSearchParams(params.toString());
        if (next) search.set('type', next); else search.delete('type');
        search.delete('page');
        search.delete('size');
        window.history.replaceState(null, '', `/feed${search.size ? `?${search}` : ''}`);
    }
    return <div className="min-h-full w-full p-3 md:p-4">
        <div className="mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-6">
            <header>
                <h1 className="text-xl font-extrabold text-j-gray-700 md:text-2xl">Home</h1>
                <p className="mt-1 text-sm text-j-gray-500">Avisos, eventos e serviços do clube.</p>
            </header>
            {!canRead ? <div role="status" className="rounded-2xl border border-j-gray-200 bg-j-white p-6 text-sm text-j-gray-600">Seu usuário não possui permissão para acessar o feed.</div> : <>
                <nav aria-label="Tipos de publicação" className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
                        <button type="button" onClick={() => filterType()} aria-pressed={!type} className={`flex min-h-14 w-full min-w-0 items-center justify-center gap-2 rounded-xl border-2 px-2 py-3 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-800 ${!type ? "border-j-blue-800 bg-j-blue-800 text-j-white" : "border-j-gray-200 text-j-gray-600 hover:bg-j-gray-100"}`}><Newspaper size={20} aria-hidden="true" className="hidden shrink-0 sm:block" />Todos</button>
                        {(["SERVICE", "NOTICE", "EVENT"] as const).map((key) => { const Icon = icons[key]; return <button key={key} type="button" onClick={() => filterType(key)} aria-pressed={type === key} className={`flex min-h-14 w-full min-w-0 items-center justify-center gap-2 rounded-xl border-2 px-2 py-3 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-800 ${type === key ? "border-j-blue-800 bg-j-blue-800 text-j-white" : "border-j-gray-200 text-j-gray-600 hover:bg-j-gray-100"}`}><Icon size={20} aria-hidden="true" className="hidden shrink-0 sm:block" />{feedTypes[key].plural}</button>; })}
                </nav>
                {query.isLoading ? <div role="status" aria-label="Carregando feed" className="grid grid-cols-1 gap-5">{Array.from({ length: 12 }, (_, index) => <div key={index} className="h-80 animate-pulse rounded-2xl bg-j-gray-200" />)}</div>
                    : query.isError && !publications.length ? <div role="alert" className="rounded-2xl border border-red-200 bg-j-white p-6"><p className="text-sm text-red-500">{query.error.message}</p><Button className="mt-4" onClick={() => void query.refetch()}>Tentar novamente</Button></div>
                    : !publications.length ? <div role="status" className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-j-gray-300 bg-j-white p-6 text-center"><Newspaper size={36} className="text-j-gray-400" aria-hidden="true" /><h2 className="mt-4 font-bold text-j-blue-800">Nenhuma publicação por aqui</h2><p className="mt-2 text-sm text-j-gray-500">Os avisos, eventos e serviços aparecem aqui depois de publicados.</p></div>
                    : <div className="grid grid-cols-1 gap-5">{publications.map((publication) => {
                        const Icon = icons[publication.type];
                        return <article
                            key={publication.id}
                            role={canDetail ? "link" : undefined}
                            tabIndex={canDetail ? 0 : undefined}
                            aria-label={canDetail ? `Abrir publicação: ${publication.title}` : undefined}
                            onClick={(event) => {
                                if (!canDetail || (event.target as Element).closest("button, a, input, textarea, select")) return;
                                openPublication(publication.id);
                            }}
                            onKeyDown={(event) => {
                                if (canDetail && event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
                                    event.preventDefault();
                                    openPublication(publication.id);
                                }
                            }}
                            className={`flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm ${canDetail ? "cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-800" : ""}`}
                        >
                            {publication.primaryImage && <div className="relative aspect-video bg-j-gray-100"><Image src={getMediaImageUrl(publication.primaryImage.storageKey)} alt={publication.title} fill unoptimized sizes="(min-width: 800px) 768px, 100vw" className="object-cover" /></div>}
                            <div className="flex flex-1 flex-col gap-4 p-5">
                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs"><span className="inline-flex items-center gap-1.5 font-bold text-j-blue-800"><Icon size={16} aria-hidden="true" />{feedTypes[publication.type].label}</span><RelativeTime value={publication.publishedAt} className="text-j-gray-500" /></div>
                                <h2 className="line-clamp-2 break-words text-lg font-extrabold text-j-blue-800">{preview(publication.title, 80)}</h2>
                                <p className="line-clamp-3 break-words text-sm leading-relaxed text-j-gray-600">{preview(publicationPlainText(publication.content), 180)}</p>
                                <FeedMetadata publication={publication} />
                                {canDetail && <button type="button" onClick={() => openPublication(publication.id)} className="self-start rounded text-sm font-bold text-j-blue-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-j-blue-800">Ler publicação completa</button>}
                                <div className="mt-auto border-t border-j-gray-200 pt-3"><FeedInteractions publication={publication} onComments={canDetail ? () => openPublication(publication.id) : undefined} /></div>
                                <PublicationCommentPreview publicationId={publication.id} count={publication.commentCount} onOpen={canDetail ? () => openPublication(publication.id) : undefined} />
                            </div>
                        </article>;
                    })}</div>}
                <div ref={loadMoreRef} className="h-px" aria-hidden="true" />
                {query.isFetchingNextPage && <p role="status" className="py-4 text-center text-sm text-j-gray-500">Carregando mais publicações...</p>}
                {query.isFetchNextPageError && <div role="alert" className="py-4 text-center"><p className="text-sm text-red-500">Não foi possível carregar mais publicações.</p><Button className="mt-3" onClick={() => void query.fetchNextPage()}>Tentar novamente</Button></div>}

            </>}
        </div>
    </div>;
}
