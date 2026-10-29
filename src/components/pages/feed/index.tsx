"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { CalendarDays, ChevronRight, Megaphone, Newspaper, Plus, Share2, Wrench } from "lucide-react";
import { Button } from "@/components/common/button";
import { listPublicationFeedAction } from "@/actions/publications/feed";
import { feedTypeSchema } from "@/schemas/publications/feed";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import { useModal } from "@/providers/ModalProvider";
import { getMediaImageUrl } from "@/utils/media/imageUrl";
import { publicationPlainText } from "@/utils/publications/content";
import { nextFeedPage, mergeFeedPages } from "@/utils/publications/infiniteFeed";
import { CreatePublicationModal } from "@/components/pages/admin/gestao-publicacoes/CreatePublicationModal";
import { PublicationDetailModal } from "./PublicationDetailModal";
import { FeedInteractions } from "./FeedInteractions";
import { FeedMetadata } from "./FeedMetadata";
import { feedTypes } from "./feedDisplay";
import { RelativeTime } from "./RelativeTime";
import { PublicationCommentPreview } from "./PublicationCommentPreview";
import { EventParticipants } from "./EventParticipants";
import { EventParticipation } from "./EventParticipation";

const icons = {
    NOTICE: Megaphone,
    EVENT: CalendarDays,
    SERVICE: Wrench,
};

function preview(value: string, max: number) {
    const text = Array.from(value);
    return text.length > max ? `${text.slice(0, max - 1).join("")}…` : value;
}

function getEventShareLink(publicationId: number) {
    const url = new URL("/feed", window.location.origin);
    url.searchParams.set("publication", String(publicationId));
    return url.toString();
}

export default function Feed() {
    const permissions = useUserStore((state) => state.permissions);
    const canRead = hasPermission(permissions, "PUBLICATIONS", "FEED_READ");
    const canDetail = hasPermission(permissions, "PUBLICATIONS", "PUBLICATION_READ");

    const canCreate = {
        EVENT: hasPermission(permissions, "PUBLICATIONS", "EVENT_CREATE"),
        NOTICE: hasPermission(permissions, "PUBLICATIONS", "NOTICE_CREATE"),
        SERVICE: hasPermission(permissions, "PUBLICATIONS", "SERVICE_REQUEST_CREATE"),
    };

    const { setContent, setOpen, setClose } = useModal();
    const params = useSearchParams();
    const typeResult = feedTypeSchema.safeParse(params.get("type"));
    const type = typeResult.success ? typeResult.data : undefined;

    const canCreateCurrentType = type
        ? canCreate[type]
        : Object.values(canCreate).some(Boolean);

    const creationType = type && canCreate[type] ? type : undefined;

    const creationLabel = creationType
        ? feedTypes[creationType].label.toLocaleLowerCase("pt-BR")
        : "publicação";

    const loadMoreRef = useRef<HTMLDivElement>(null);
    const openedDeepLinkRef = useRef<number | null>(null);
    const filterNavRef = useRef<HTMLElement>(null);
    const [showFilterHint, setShowFilterHint] = useState(false);

    useEffect(() => {
        const nav = filterNavRef.current;
        if (!nav) return;

        const updateHint = () => {
            setShowFilterHint(
                nav.scrollWidth > nav.clientWidth + 1 &&
                    nav.scrollLeft + nav.clientWidth < nav.scrollWidth - 1
            );
        };

        updateHint();
        nav.addEventListener("scroll", updateHint, { passive: true });
        const resizeObserver = new ResizeObserver(updateHint);
        resizeObserver.observe(nav);
        return () => {
            nav.removeEventListener("scroll", updateHint);
            resizeObserver.disconnect();
        };
    }, []);

    const query = useInfiniteQuery({
        queryKey: ["publications", "feed", "infinite", type, permissions],
        queryFn: ({ pageParam }) =>
            listPublicationFeedAction({
                type,
                page: pageParam,
                size: 12,
            }),
        initialPageParam: 0,
        getNextPageParam: nextFeedPage,
        enabled: canRead,
    });

    const publications = mergeFeedPages(query.data?.pages ?? []);

    const {
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchNextPageError,
    } = query;

    const pageCount = query.data?.pages.length ?? 0;

    useEffect(() => {
        const sentinel = loadMoreRef.current;

        if (
            !sentinel ||
            !canRead ||
            !hasNextPage ||
            isFetching ||
            isFetchNextPageError
        ) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    observer.disconnect();
                    void fetchNextPage({ cancelRefetch: false });
                }
            },
            {
                root: sentinel.closest("[data-dashboard-scroll]"),
                rootMargin: "300px 0px",
            }
        );

        observer.observe(sentinel);

        return () => observer.disconnect();
    }, [
        canRead,
        hasNextPage,
        isFetching,
        isFetchNextPageError,
        fetchNextPage,
        pageCount,
    ]);

    function closePublication() {
        const search = new URLSearchParams(window.location.search);
        search.delete("publication");

        window.history.replaceState(
            null,
            "",
            `${window.location.pathname}${search.size ? `?${search}` : ""}`
        );

        openedDeepLinkRef.current = null;
        setClose();
    }

    function openPublication(id: number) {
        setContent(
            <PublicationDetailModal
                publicationId={id}
                onClose={closePublication}
            />
        );

        setOpen();
    }

    useEffect(() => {
        const id = Number(params.get("publication"));

        if (
            !canDetail ||
            !Number.isInteger(id) ||
            id <= 0 ||
            openedDeepLinkRef.current === id
        ) {
            return;
        }

        openedDeepLinkRef.current = id;
        openPublication(id);

        // openPublication reads stable modal actions from the provider;
        // the ref prevents re-opening on rerenders.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params, canDetail]);

    function filterType(next?: "NOTICE" | "EVENT" | "SERVICE") {
        const search = new URLSearchParams(params.toString());

        if (next) {
            search.set("type", next);
        } else {
            search.delete("type");
        }

        search.delete("page");
        search.delete("size");
        search.delete("publication");

        window.history.replaceState(
            null,
            "",
            `/feed${search.size ? `?${search}` : ""}`
        );
    }

    function openCreatePublication() {
        setContent(
            <CreatePublicationModal
                initialType={creationType}
                publishEventImmediately
            />
        );

        setOpen();
    }

    return (
        <div className="min-h-full w-full px-3 py-4 md:px-6 md:py-6">
            <div className="mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-5 md:gap-6">
                {!canRead ? (
                    <div
                        role="status"
                        className="rounded-2xl border border-j-gray-200 bg-j-white p-6 text-sm text-j-gray-600"
                    >
                        Seu usuário não possui permissão para acessar o feed.
                    </div>
                ) : (
                    <>
                        <h1 className="sr-only">Mural do clube</h1>

                        <div className="flex min-w-0 items-center gap-3">
                            <div className="relative min-w-0 flex-1">
                                <nav
                                    ref={filterNavRef}
                                    aria-label="Tipos de publicação"
                                    aria-describedby="feed-filter-swipe-hint"
                                    className="flex min-w-0 gap-2 overflow-x-auto overscroll-x-contain rounded-2xl border border-j-gray-200 bg-j-white p-2 shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                                >
                                <button
                                    type="button"
                                    onClick={() => filterType()}
                                    aria-pressed={!type}
                                    className={`flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-800 ${
                                        !type
                                            ? "bg-j-blue-800 text-j-white shadow-sm"
                                            : "text-j-gray-600 hover:bg-j-gray-100"
                                    }`}
                                >
                                    <Newspaper size={17} aria-hidden="true" />
                                    Tudo
                                </button>

                                {(["SERVICE", "NOTICE", "EVENT"] as const).map(
                                    (key) => {
                                        const Icon = icons[key];

                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => filterType(key)}
                                                aria-pressed={type === key}
                                                className={`flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-800 ${
                                                    type === key
                                                        ? "bg-j-blue-800 text-j-white shadow-sm"
                                                        : "text-j-gray-600 hover:bg-j-gray-100"
                                                }`}
                                            >
                                                <Icon
                                                    size={17}
                                                    aria-hidden="true"
                                                />
                                                {feedTypes[key].plural}
                                            </button>
                                        );
                                    }
                                )}
                                </nav>
                                <span id="feed-filter-swipe-hint" className="sr-only">
                                    Deslize horizontalmente para ver mais tipos de publicação.
                                </span>
                                {showFilterHint && (
                                    <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 flex items-center rounded-r-2xl bg-gradient-to-l from-j-white via-j-white/95 to-transparent pl-5 pr-2 md:hidden">
                                        <span className="inline-flex items-center gap-0.5 rounded-full bg-j-white/90 py-1 pl-2 pr-1 text-[10px] font-bold text-j-blue-700 shadow-sm">
                                            Deslize <ChevronRight size={14} />
                                        </span>
                                    </div>
                                )}
                            </div>

                            {canCreateCurrentType && (
                                <button
                                    type="button"
                                    aria-label={`Criar ${creationLabel}`}
                                    title={`Criar ${creationLabel}`}
                                    onClick={openCreatePublication}
                                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-j-yellow-300 text-j-blue-900 shadow-sm transition-transform hover:scale-105 hover:bg-j-yellow-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-j-blue-800"
                                >
                                    <Plus
                                        size={25}
                                        strokeWidth={2.8}
                                        aria-hidden="true"
                                    />
                                </button>
                            )}
                        </div>

                        {query.isLoading ? (
                            <div
                                role="status"
                                aria-label="Carregando feed"
                                className="grid grid-cols-1 gap-5"
                            >
                                {Array.from({ length: 5 }, (_, index) => (
                                    <div
                                        key={index}
                                        className="h-80 animate-pulse rounded-3xl bg-j-gray-200"
                                    />
                                ))}
                            </div>
                        ) : query.isError && !publications.length ? (
                            <div
                                role="alert"
                                className="rounded-2xl border border-red-200 bg-j-white p-6"
                            >
                                <p className="text-sm text-red-500">
                                    {query.error.message}
                                </p>

                                <Button
                                    className="mt-4"
                                    onClick={() => void query.refetch()}
                                >
                                    Tentar novamente
                                </Button>
                            </div>
                        ) : !publications.length ? (
                            <div
                                role="status"
                                className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-j-gray-300 bg-j-white p-8 text-center shadow-sm"
                            >
                                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-j-yellow-300/30 text-j-blue-800">
                                    <Newspaper
                                        size={27}
                                        aria-hidden="true"
                                    />
                                </span>

                                <h2 className="mt-4 text-lg font-extrabold text-j-blue-800">
                                    {type
                                        ? `Nenhum ${feedTypes[
                                              type
                                          ].label.toLocaleLowerCase(
                                              "pt-BR"
                                          )} publicado ainda`
                                        : "Nenhuma publicação por aqui"}
                                </h2>

                                <p className="mt-2 max-w-sm text-sm leading-relaxed text-j-gray-500">
                                    {type
                                        ? `As publicações de ${feedTypes[
                                              type
                                          ].plural.toLocaleLowerCase(
                                              "pt-BR"
                                          )} aparecem aqui quando forem publicadas.`
                                        : "Avisos, eventos e serviços do clube aparecem aqui quando forem publicados."}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-5">
                                {publications.map((publication) => {
                                    const Icon = icons[publication.type];
                                    const isEvent = publication.type === "EVENT";

                                    return (
                                        <article
                                            key={publication.id}
                                            role={canDetail ? "link" : undefined}
                                            tabIndex={canDetail ? 0 : undefined}
                                            aria-label={
                                                canDetail
                                                    ? `Abrir publicação: ${publication.title}`
                                                    : undefined
                                            }
                                            onClick={(event) => {
                                                if (
                                                    !canDetail ||
                                                    (
                                                        event.target as Element
                                                    ).closest(
                                                        "button, a, input, textarea, select"
                                                    )
                                                ) {
                                                    return;
                                                }

                                                openPublication(publication.id);
                                            }}
                                            onKeyDown={(event) => {
                                                if (
                                                    canDetail &&
                                                    event.target ===
                                                        event.currentTarget &&
                                                    (
                                                        event.key === "Enter" ||
                                                        event.key === " "
                                                    )
                                                ) {
                                                    event.preventDefault();
                                                    openPublication(
                                                        publication.id
                                                    );
                                                }
                                            }}
                                            className={`flex w-full min-w-0 flex-col overflow-hidden rounded-3xl border border-j-gray-200 bg-j-white shadow-sm transition-shadow hover:shadow-md ${
                                                canDetail
                                                    ? "cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-800"
                                                    : ""
                                            }`}
                                        >
                                            {publication.primaryImage && (
                                                <div className="relative aspect-[16/9] bg-j-gray-100">
                                                    <Image
                                                        src={getMediaImageUrl(
                                                            publication
                                                                .primaryImage
                                                                .storageKey
                                                        )}
                                                        alt={publication.title}
                                                        fill
                                                        unoptimized
                                                        sizes="(min-width: 800px) 768px, 100vw"
                                                        className="object-cover"
                                                    />

                                                    {isEvent && (
                                                        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-j-yellow-300 px-3 py-1.5 text-xs font-extrabold text-j-blue-900 shadow-md">
                                                            <CalendarDays
                                                                size={14}
                                                                aria-hidden="true"
                                                            />
                                                            Próximo evento
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex flex-1 flex-col gap-4 p-5 md:p-6">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold ${
                                                            isEvent
                                                                ? "bg-j-yellow-300/30 text-j-blue-900"
                                                                : "bg-j-gray-100 text-j-blue-800"
                                                        }`}
                                                    >
                                                        <Icon
                                                            size={15}
                                                            aria-hidden="true"
                                                        />
                                                        {
                                                            feedTypes[
                                                                publication.type
                                                            ].label
                                                        }
                                                    </span>

                                                    <RelativeTime
                                                        value={
                                                            publication.publishedAt
                                                        }
                                                        className="text-xs text-j-gray-500"
                                                    />
                                                </div>

                                                <div>
                                                    <h2 className="line-clamp-2 break-words text-xl font-extrabold text-j-blue-800">
                                                        {preview(
                                                            publication.title,
                                                            100
                                                        )}
                                                    </h2>

                                                    <p className="mt-2 line-clamp-3 break-words text-sm leading-relaxed text-j-gray-600">
                                                        {preview(
                                                            publicationPlainText(
                                                                publication.content
                                                            ),
                                                            220
                                                        )}
                                                    </p>
                                                </div>

                                                <FeedMetadata
                                                    publication={publication}
                                                />

                                                {publication.type === "EVENT" && (
                                                    <EventParticipants
                                                        details={
                                                            publication.details
                                                        }
                                                    />
                                                )}

                                                {publication.type === "EVENT" && (
                                                    <EventParticipation
                                                        eventId={publication.id}
                                                        eventStatus={
                                                            publication.details
                                                                .status
                                                        }
                                                        compact
                                                    />
                                                )}

                                                {canDetail && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openPublication(
                                                                publication.id
                                                            )
                                                        }
                                                        className="self-start rounded text-sm font-bold text-j-blue-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-j-blue-800"
                                                    >
                                                        Ver publicação completa
                                                    </button>
                                                )}

                                                <div className="mt-auto border-t border-j-gray-200 pt-3">
                                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                                        <FeedInteractions
                                                            publication={
                                                                publication
                                                            }
                                                            onComments={
                                                                canDetail
                                                                    ? () =>
                                                                          openPublication(
                                                                              publication.id
                                                                          )
                                                                    : undefined
                                                            }
                                                        />

                                                        {isEvent &&
                                                            canDetail && (
                                                                <a
                                                                    href={`https://wa.me/?text=${encodeURIComponent(
                                                                        `Vamos nesse evento do Jeep Clube Tamoios? ${publication.title}\n${getEventShareLink(
                                                                            publication.id
                                                                        )}`
                                                                    )}`}
                                                                    target="_blank"
                                                                    rel="noreferrer noopener"
                                                                    aria-label={`Compartilhar evento ${publication.title} no WhatsApp`}
                                                                    onClick={(
                                                                        event
                                                                    ) =>
                                                                        event.stopPropagation()
                                                                    }
                                                                    className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#25D366]/10 px-4 text-sm font-bold text-[#168A43] transition-colors hover:bg-[#25D366]/20 focus-visible:outline-2 focus-visible:outline-j-blue-800"
                                                                >
                                                                    <Share2
                                                                        size={
                                                                            16
                                                                        }
                                                                        aria-hidden="true"
                                                                    />
                                                                    Compartilhar
                                                                </a>
                                                            )}
                                                    </div>
                                                </div>

                                                <PublicationCommentPreview
                                                    publicationId={
                                                        publication.id
                                                    }
                                                    count={
                                                        publication.commentCount
                                                    }
                                                    onOpen={
                                                        canDetail
                                                            ? () =>
                                                                  openPublication(
                                                                      publication.id
                                                                  )
                                                            : undefined
                                                    }
                                                />
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}

                        <div
                            ref={loadMoreRef}
                            className="h-px"
                            aria-hidden="true"
                        />

                        {query.isFetchingNextPage && (
                            <p
                                role="status"
                                className="py-4 text-center text-sm text-j-gray-500"
                            >
                                Carregando mais publicações...
                            </p>
                        )}

                        {query.isFetchNextPageError && (
                            <div
                                role="alert"
                                className="py-4 text-center"
                            >
                                <p className="text-sm text-red-500">
                                    Não foi possível carregar mais publicações.
                                </p>

                                <Button
                                    className="mt-3"
                                    onClick={() =>
                                        void query.fetchNextPage()
                                    }
                                >
                                    Tentar novamente
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
