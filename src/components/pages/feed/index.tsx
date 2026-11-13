"use client";

import { useEffect, useRef, useState } from "react";
import { Button as AriaButton, Dialog, DialogTrigger, Popover } from "react-aria-components";
import { useSearchParams } from "next/navigation";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Menu, Megaphone, Newspaper, Plus, RefreshCw, Share2, Store, X } from "lucide-react";
import { Button } from "@/components/common/button";
import { useModal } from "@/providers/ModalProvider";
import type { PublicationFeedFilters } from "@/schemas/publications/feed";
import { parsePublicationFeedFilters, updatePublicationFeedFilters } from "@/utils/publications/feedFilters";
import { FeedPeriodFilters } from "./FeedPeriodFilters";
import { ModalRoot } from "@/components/common/modal/root";
import { listPublicationFeedAction } from "@/server/actions/publications/feed";
import { useUserStore } from "@/stores/userStore";
import { getMediaImageUrl } from "@/utils/media/imageUrl";
import { hasPermission } from "@/utils/permission/hasPermission";
import { publicationPlainText } from "@/utils/publications/content";
import { mergeFeedPages, nextFeedPage } from "@/utils/publications/infiniteFeed";
import { feedTypes, publicationReadError, publicationReadRetry } from "./feedDisplay";
import { CreatePublicationModal } from "@/components/pages/admin/publications/CreatePublicationModal";
import { PublicationDetailModal } from "./PublicationDetailModal";
import { FeedInteractions } from "./FeedInteractions";
import { FeedMetadata } from "./FeedMetadata";
import { PublicationCommentPreview } from "./PublicationCommentPreview";
import { RelativeTime } from "./RelativeTime";
import { EventParticipants } from "./EventParticipants";
import { EventParticipation } from "./EventParticipation";
import { PublicationSkeletons } from "./FeedLoading";
import { FeedSidebar } from "./FeedSidebar";
import { usePageTour } from "@/hooks/useTour";
import { getFeedTourSteps } from "@/config/tourSteps";

import Image from "next/image";

const publicationFilterIcons = {
    SERVICE: Store,
    NOTICE: Megaphone,
    EVENT: CalendarDays,
} as const;

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
    const canCreate = {
        EVENT: hasPermission(permissions, "PUBLICATIONS", "EVENT_CREATE"),
        NOTICE: hasPermission(permissions, "PUBLICATIONS", "NOTICE_CREATE"),
        SERVICE: hasPermission(permissions, "PUBLICATIONS", "SERVICE_REQUEST_CREATE"),
    };
    const { setContent, setOpen, content: activeModal } = useModal();
    const params = useSearchParams();
    const filtersResult = parsePublicationFeedFilters(params);
    const filters = filtersResult.success ? filtersResult.data : {};
    const { type, publishedFrom, publishedTo } = filters;
    const publicationPickerRef = useRef<HTMLDialogElement>(null);
    const detailValue = params.get('publication');
    const detailId = detailValue && /^\d+$/.test(detailValue) && Number.isSafeInteger(Number(detailValue)) && Number(detailValue) > 0 ? Number(detailValue) : null;
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

    const loadMoreRef = useRef<HTMLDivElement>(null);
    const filterNavRef = useRef<HTMLElement>(null);
    const [showFilterIcons, setShowFilterIcons] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [mobileCreateOpen, setMobileCreateOpen] = useState(false);
    const [periodOpen, setPeriodOpen] = useState(false);

    useEffect(() => {
        const nav = filterNavRef.current;
        if (!nav) return;

        const updateIconVisibility = () => {
            const buttons = Array.from(nav.querySelectorAll<HTMLButtonElement>("[data-feed-filter]"));
            const navStyle = getComputedStyle(nav);
            const navPadding = (Number.parseFloat(navStyle.paddingLeft) || 0) + (Number.parseFloat(navStyle.paddingRight) || 0);
            const navGap = Number.parseFloat(navStyle.columnGap) || 0;
            const requiredButtonWidth = buttons.reduce((total, button) => {
                const label = button.querySelector<HTMLElement>("[data-filter-label]");
                const icon = button.querySelector<SVGElement>("[data-filter-icon]");
                const buttonStyle = getComputedStyle(button);
                const padding = (Number.parseFloat(buttonStyle.paddingLeft) || 0) + (Number.parseFloat(buttonStyle.paddingRight) || 0);
                const contentGap = icon ? Number.parseFloat(buttonStyle.columnGap) || 0 : 0;
                const iconWidth = icon ? Number.parseFloat(getComputedStyle(icon).width) || 17 : 0;
                return total + (label?.scrollWidth ?? 0) + iconWidth + contentGap + padding;
            }, 0);
            const requiredWidth = navPadding + requiredButtonWidth + Math.max(0, buttons.length - 1) * navGap;
            setShowFilterIcons(nav.clientWidth >= requiredWidth);
        };

        updateIconVisibility();
        const observer = new ResizeObserver(updateIconVisibility);
        observer.observe(nav);
        return () => observer.disconnect();
    }, []);

    const queryClient = useQueryClient();
    const feedKey = ["publications", "feed", "infinite", { type, publishedFrom, publishedTo, size: 12 }, permissions];
    const [isRefreshing, setIsRefreshing] = useState(false);

    async function refreshFeed() {
        setIsRefreshing(true);
        try {
            await queryClient.resetQueries({ queryKey: feedKey, exact: true });
        } finally {
            setIsRefreshing(false);
        }
    }
    const query = useInfiniteQuery({
        queryKey: feedKey,
        queryFn: ({ pageParam }) =>
            listPublicationFeedAction({
                type, publishedFrom, publishedTo,
                page: pageParam,
                size: 12,
            }),
        initialPageParam: 0,
        getNextPageParam: nextFeedPage,
        enabled: filtersResult.success,
        staleTime: 0,
        retry: publicationReadRetry,
    });

    const failure = publicationReadError(query.error);
    const publications = failure.restricted || !filtersResult.success ? [] : mergeFeedPages(query.data?.pages ?? []);

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
            !filtersResult.success ||
            failure.restricted ||
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
        filtersResult.success,
        failure.restricted,
        hasNextPage,
        isFetching,
        isFetchNextPageError,
        fetchNextPage,
        pageCount,
    ]);

    function closePublication() {
        const search = new URLSearchParams(window.location.search);
        search.delete('publication');
        window.history.replaceState(null, '', `/feed${search.size ? `?${search}` : ''}`);
    }

    function publicationHref(id: number) {
        const search = new URLSearchParams(params.toString());
        search.set('publication', String(id));
        return `/feed?${search}`;
    }

    function openPublication(id: number) {
        window.history.pushState(null, '', publicationHref(id));
    }

    function applyFilters(next: PublicationFeedFilters) {
        const search = updatePublicationFeedFilters(new URLSearchParams(params.toString()), next);
        window.history.replaceState(null, '', `/feed${search.size ? `?${search}` : ''}`);
    }

    function filterType(next?: 'NOTICE' | 'EVENT' | 'SERVICE') {
        const search = new URLSearchParams(params.toString());
        search.delete('type');
        if (next) search.set('type', next);
        for (const key of ['publication', 'page', 'size']) search.delete(key);
        window.history.replaceState(null, '', `/feed${search.size ? `?${search}` : ''}`);
    }

    function openCreatePublication(initialType: keyof typeof canCreate) {
        publicationPickerRef.current?.close();
        setMobileCreateOpen(false);
        setContent(<CreatePublicationModal initialType={initialType} publishEventImmediately />);
        setOpen();
    }

    function openPublicationPicker(trigger: HTMLButtonElement) {
        const dialog = publicationPickerRef.current;
        if (!dialog || dialog.open) return;

        const start = trigger.getBoundingClientRect();
        dialog.showModal();
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const end = dialog.getBoundingClientRect();
        dialog.animate([
            { transform: `translate(${start.left - end.left}px, ${start.top - end.top}px) scale(${start.width / end.width}, ${start.height / end.height})`, opacity: 0.65 },
            { transform: "none", opacity: 1 },
        ], { duration: 250, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
    }

    const publicationOptions = [
        { type: "EVENT" as const, label: "Publicar evento", icon: CalendarDays },
        { type: "NOTICE" as const, label: "Publicar aviso", icon: Megaphone },
        { type: "SERVICE" as const, label: "Publicar serviço", icon: Store },
    ].filter((option) => canCreate[option.type]);

    return (
        <div tabIndex={-1} data-publication-return className="min-h-full w-full px-3 py-4 focus:outline-none md:px-6 md:py-6">
            <div className="mx-auto grid w-full min-w-0 max-w-7xl grid-cols-1 gap-5 md:gap-6 lg:grid-cols-[minmax(0,1fr)_clamp(14rem,27%,20rem)] lg:items-start">
                <div className="flex w-full min-w-0 flex-col gap-5 md:gap-6">
                        <>
                            <h1 tabIndex={-1} className="sr-only">Mural do clube</h1>

                            <div className="flex min-w-0 items-center gap-1 rounded-2xl border border-j-gray-200 bg-j-white p-1.5 shadow-sm sm:gap-2 sm:p-2">
                                <div className="relative min-w-0 flex-1">
                                    <nav
                                        ref={filterNavRef}
                                        aria-label="Tipos de publicação"
                                        className="flex min-w-0 flex-1 gap-1 sm:gap-2"
                                    >
                                        <button
                                            data-feed-filter
                                            type="button"
                                            onClick={() => filterType()}
                                            aria-pressed={!type}
                                            className={`flex min-h-10 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-1.5 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-800 sm:min-h-11 sm:gap-2 sm:px-3 sm:text-sm ${!type
                                                    ? "bg-j-blue-800 text-j-white shadow-sm"
                                                    : "text-j-gray-600 hover:bg-j-gray-100"
                                                }`}
                                        >
                                            <Newspaper data-filter-icon size={17} className={`shrink-0 ${showFilterIcons ? "" : "hidden"}`} aria-hidden="true" />
                                            <span data-filter-label className="whitespace-nowrap">Tudo</span>
                                        </button>

                                        {(["SERVICE", "NOTICE", "EVENT"] as const).map(
                                            (key) => {
                                                const Icon = publicationFilterIcons[key];

                                                return (
                                                    <button
                                                        data-feed-filter
                                                        key={key}
                                                        type="button"
                                                        onClick={() => filterType(key)}
                                                        aria-pressed={type === key}
                                                        className={`flex min-h-10 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-1.5 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-800 sm:min-h-11 sm:gap-2 sm:px-3 sm:text-sm ${type === key
                                                                ? "bg-j-blue-800 text-j-white shadow-sm"
                                                                : "text-j-gray-600 hover:bg-j-gray-100"
                                                            }`}
                                                    >
                                                        <Icon data-filter-icon size={17} className={`shrink-0 ${showFilterIcons ? "" : "hidden"}`} aria-hidden="true" />
                                                        <span data-filter-label className="whitespace-nowrap">{feedTypes[key].plural}</span>
                                                    </button>
                                                );
                                            }
                                        )}
                                    </nav>

                                </div>

                                <button type="button" aria-label="Abrir painel de eventos, aniversariantes e avisos" aria-expanded={mobileSidebarOpen} onClick={() => setMobileSidebarOpen(true)} className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl text-primary hover:bg-background-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-input-border-focus lg:hidden">
                                    <Menu size={20} aria-hidden="true" />
                                </button>

                                <DialogTrigger isOpen={periodOpen} onOpenChange={setPeriodOpen}>
                                    <AriaButton aria-label="Filtrar por período" className={`hidden size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-input-border-focus lg:flex ${publishedFrom || publishedTo ? 'bg-button-primary-bg text-button-primary-text' : 'bg-background text-primary hover:bg-background-tertiary'}`}><CalendarDays size={21} aria-hidden="true" /></AriaButton>
                                    <Popover placement="bottom end" className="z-[100] w-[min(38rem,calc(100vw-2rem))] outline-none"><Dialog aria-label="Filtrar publicações por período" className="outline-none"><FeedPeriodFilters publishedFrom={params.get('publishedFrom') ?? undefined} publishedTo={params.get('publishedTo') ?? undefined} onApply={period => { applyFilters({ type, ...period }); setPeriodOpen(false); }} /></Dialog></Popover>
                                </DialogTrigger>
                            </div>

                            <Button
                                disabled={!filtersResult.success || query.isFetching}
                                isLoading={isRefreshing}
                                onClick={() => void refreshFeed()}
                                className={`hidden min-h-11 transition-[background-color,color,box-shadow,scale,translate] lg:flex ${isRefreshing ? "disabled:cursor-wait disabled:bg-button-primary-bg disabled:text-button-primary-text" : ""}`}
                            >
                                <RefreshCw size={17} aria-hidden="true" className={isRefreshing ? "motion-safe:animate-spin" : undefined} />
                                <span className="ml-1">{isRefreshing ? "Atualizando publicações…" : "Atualizar publicações"}</span>
                            </Button>
                            <div key={type ?? "all"} className={query.isLoading ? "min-w-0" : "app-route-enter min-w-0 motion-reduce:animate-none"}>
                            {!filtersResult.success ? <div role="alert" className="rounded-xl bg-j-white p-4 text-j-gray-700"><p>Revise os filtros da URL. Use um tipo válido e instantes UTC com início anterior ou igual ao fim.</p><Button onClick={() => applyFilters({})}>Limpar filtros</Button></div> : query.isLoading ? (
                                <PublicationSkeletons label="Carregando publicações..." featured />
                            ) : query.isError && !publications.length ? (
                                <div
                                    role="alert"
                                    className="rounded-2xl border border-red-200 bg-j-white p-6"
                                >
                                    <p className="text-sm text-input-error-text">
                                        {failure.message}
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
                                    className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-j-gray-300 bg-j-white px-5 py-8 text-center shadow-sm sm:px-8"
                                >
                                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-j-yellow-300/30 text-j-blue-800">
                                        <Newspaper
                                            size={27}
                                            aria-hidden="true"
                                        />
                                    </span>

                                    <div role="status" className="mt-5 max-w-sm space-y-2">
                                    <h2 className="text-lg font-extrabold text-j-blue-800">
                                        {publishedFrom || publishedTo
                                            ? "Nenhuma publicação neste período"
                                            : type
                                            ? `Nenhum ${feedTypes[
                                                type
                                            ].label.toLocaleLowerCase(
                                                "pt-BR"
                                            )
                                            } publicado ainda`
                                            : "Nenhuma publicação por aqui"}
                                    </h2>

                                    <p className="text-sm leading-relaxed text-secondary">
                                        {publishedFrom || publishedTo
                                            ? "Altere o período ou limpe os filtros para ver outras publicações."
                                            : type
                                                ? "Veja o que está acontecendo nas outras categorias do feed."
                                                : "Avisos, eventos e serviços do clube aparecem aqui."}
                                    </p>
                                    </div>
                                    {(type || publishedFrom || publishedTo) && (
                                        <Button className="mt-5" onClick={() => applyFilters({})}>Limpar filtros</Button>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-5">
                                    {publications.map((publication) => {
                                        const Icon = publicationFilterIcons[publication.type];
                                        const isEvent = publication.type === "EVENT";

                                        return (
                                            <article
                                                key={publication.id}
                                                onClickCapture={event => {
                                                    // Safari does not focus pointer-activated links/buttons by default.
                                                    // Remember the actual control before the modal takes focus.
                                                    (event.target as Element).closest<HTMLElement>('a, button')?.focus({ preventScroll: true });
                                                }}
                                                className="flex w-full min-w-0 flex-col overflow-hidden rounded-3xl border border-j-gray-200 bg-j-white shadow-sm"
                                            >
                                                {publication.primaryImage && !failedImages.has(publication.primaryImage.storageKey) && (
                                                    <div className="relative aspect-[16/9] bg-j-gray-100">
                                                        <Image
                                                            src={getMediaImageUrl(
                                                                publication
                                                                    .primaryImage
                                                                    .storageKey
                                                            )}
                                                            onError={() => setFailedImages(previous => new Set(previous).add(publication.primaryImage!.storageKey))}
                                                            alt={publication.title}
                                                            fill
                                                            unoptimized
                                                            sizes="(min-width: 800px) 768px, 100vw"
                                                            className="object-cover"
                                                        />

                                                        {isEvent && publication.details.status === "OPEN" && (
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

                                                {publication.primaryImage && failedImages.has(publication.primaryImage.storageKey) && <div role="status" className="bg-j-gray-100 p-4 text-sm text-j-gray-600">Imagem indisponível.<Button onClick={() => setFailedImages(previous => { const next = new Set(previous); next.delete(publication.primaryImage!.storageKey); return next; })}>Tentar imagem novamente</Button></div>}
                                                <div className="flex flex-1 flex-col gap-4 p-5 md:p-6">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold ${isEvent
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

                                                        <a aria-label={`Ver publicação completa: ${publication.title}`} href={publicationHref(publication.id)} onClick={event => {
                                                            if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                                                            event.preventDefault(); openPublication(publication.id);
                                                        }} className="cursor-pointer self-start rounded text-sm font-bold text-j-blue-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-j-blue-800">Ver publicação completa<span className="sr-only">: {publication.title}</span></a>

                                                    <div className="mt-auto border-t border-j-gray-200 pt-3">
                                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                                            <FeedInteractions
                                                                publication={
                                                                    publication
                                                                }
                                                                onComments={() => openPublication(publication.id)}
                                                            />

                                                            {isEvent && (
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
                                                                        className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#25D366]/10 px-4 text-sm font-bold text-j-blue-800 transition-colors hover:bg-[#25D366]/20 focus-visible:outline-2 focus-visible:outline-j-blue-800"
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
                                                        onOpen={() => openPublication(publication.id)}
                                                    />
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}

                            </div>
                            {filtersResult.success && query.hasNextPage && !failure.restricted && <Button disabled={query.isFetching} aria-busy={query.isFetchingNextPage} onClick={() => void query.fetchNextPage({ cancelRefetch: false })}>Carregar mais publicações</Button>}
                            {query.isRefetchError && !query.isFetchNextPageError && publications.length > 0 && <p role="alert" className="rounded-xl bg-j-white p-4 text-j-gray-700">Não foi possível atualizar. Exibindo as publicações carregadas anteriormente.</p>}
                            <div
                                ref={loadMoreRef}
                                className="h-px"
                                aria-hidden="true"
                            />

                            {query.isFetchingNextPage && (
                                <PublicationSkeletons label="Carregando mais publicações..." count={1} />
                            )}

                            {query.isFetchNextPageError && (
                                <div
                                    role="alert"
                                    className="py-4 text-center"
                                >
                                    <p className="text-sm text-input-error-text">
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
                </div>
                <FeedSidebar
                    canCreate={publicationOptions.length > 0}
                    onCreate={(event) => openPublicationPicker(event.currentTarget)}
                    mobileOpen={mobileSidebarOpen}
                    onCloseMobile={() => setMobileSidebarOpen(false)}
                    mobilePeriodFilter={
                        <FeedPeriodFilters
                            compact
                            publishedFrom={params.get("publishedFrom") ?? undefined}
                            publishedTo={params.get("publishedTo") ?? undefined}
                            onApply={period => {
                                applyFilters({ type, ...period });
                                setMobileSidebarOpen(false);
                            }}
                        />
                    }
                />
            </div>
            <dialog ref={publicationPickerRef} aria-labelledby="publication-picker-title" className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md origin-top-left rounded-3xl border border-input-border bg-background p-5 text-primary shadow-xl backdrop:bg-black/60 sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 id="publication-picker-title" className="text-lg font-extrabold">O que você quer postar?</h2>
                    <button type="button" aria-label="Fechar" onClick={() => publicationPickerRef.current?.close()} className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full bg-j-gray-100 hover:bg-j-gray-200 focus-visible:outline-2">
                        <X size={20} aria-hidden="true" />
                    </button>
                </div>
                <div className="grid gap-2">
                    {publicationOptions.map(({ type: optionType, label, icon: Icon }) => (
                        <button key={optionType} type="button" onClick={() => openCreatePublication(optionType)} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-input-border px-4 text-left font-bold transition-colors hover:bg-j-yellow-300 hover:text-j-blue-900 focus-visible:outline-2">
                            <Icon size={19} aria-hidden="true" />
                            {label}
                        </button>
                    ))}
                </div>
            </dialog>
            {publicationOptions.length > 0 && <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 z-[90] lg:hidden">
                <button type="button" aria-label="Fechar opções de publicação" aria-hidden={!mobileCreateOpen} tabIndex={mobileCreateOpen ? 0 : -1} onClick={() => setMobileCreateOpen(false)} className={`fixed inset-0 z-0 cursor-default bg-black/15 transition-opacity duration-200 motion-reduce:transition-none ${mobileCreateOpen ? "opacity-100" : "pointer-events-none opacity-0"}`} />
                <div role="menu" aria-label="Escolher tipo de publicação" aria-hidden={!mobileCreateOpen} inert={!mobileCreateOpen} className={`absolute right-0 bottom-full z-10 mb-3 flex w-56 max-w-[calc(100vw-2rem)] origin-bottom-right flex-col overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-xl transition-[opacity,translate,scale,visibility] duration-250 ease-out motion-reduce:transition-none ${mobileCreateOpen ? "visible translate-y-0 scale-100 opacity-100" : "invisible pointer-events-none translate-y-2 scale-95 opacity-0"}`}>
                    {publicationOptions.map(({ type: optionType, label, icon: Icon }) => <button key={optionType} type="button" role="menuitem" onClick={() => openCreatePublication(optionType)} className="flex min-h-12 cursor-pointer items-center gap-3 border-b border-j-gray-100 px-4 text-left text-sm font-bold text-j-blue-900 transition-colors last:border-b-0 hover:bg-j-blue-50 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-j-blue-700"><Icon size={18} className="shrink-0 text-j-blue-800" aria-hidden="true" />{label}</button>)}
                </div>
                <button type="button" aria-label={mobileCreateOpen ? "Fechar opções de publicação" : "Criar publicação"} aria-haspopup="menu" aria-expanded={mobileCreateOpen} onClick={() => setMobileCreateOpen((open) => !open)} className="relative z-10 flex size-14 cursor-pointer items-center justify-center rounded-full bg-j-yellow-300 text-j-blue-900 shadow-lg transition-transform hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-800 motion-reduce:transform-none">
                    <Plus
                        size={27}
                        aria-hidden="true"
                        className={`transition-[rotate] duration-500 ease-in-out motion-reduce:transition-none ${mobileCreateOpen ? "rotate-[405deg]" : "rotate-0"}`}
                    />
                </button>
            </div>}
            {detailValue && !detailId && <p role="alert">Identificação de publicação inválida.</p>}
            {detailId && <ModalRoot isOpen isEscapable={!activeModal} onClose={closePublication}><PublicationDetailModal key={detailId} publicationId={detailId} onClose={closePublication} /></ModalRoot>}
        </div>
    );
}
