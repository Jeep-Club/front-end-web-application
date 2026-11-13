"use client";

import { useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { Button as AriaButton, Dialog, DialogTrigger, Popover } from "react-aria-components";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { PublicationFeedItem } from "@/schemas/publications/feed";
import type { ActionFailure } from "@/utils/http/ActionError";
import { CalendarDays, ChevronRight, Megaphone, Newspaper, Pencil, Plus, Share2, Wrench } from "lucide-react";
import { Button } from "@/components/common/button";

import type { PublicationFeedFilters } from "@/schemas/publications/feed";
import { parsePublicationFeedFilters, updatePublicationFeedFilters } from "@/utils/publications/feedFilters";
import { FeedPeriodFilters } from "./FeedPeriodFilters";

import { useUserStore } from "@/stores/userStore";
import { getMediaImageUrl } from "@/utils/media/imageUrl";
import { hasPermission } from "@/utils/permission/hasPermission";
import { publicationPlainText } from "@/utils/publications/content";

import { FeedInteractions } from "./FeedInteractions";
import { FeedMetadata } from "./FeedMetadata";
import { PublicationCommentPreview } from "./PublicationCommentPreview";
import { RelativeTime } from "./RelativeTime";
import { EventParticipants } from "./EventParticipants";
import { EventParticipation } from "./EventParticipation";
import { FeedSidebar } from "./FeedSidebar";

import Image from "next/image";
import { feedTypes, publicationReadError } from "./feedDisplay";

const publicationFilterIcons = {
    SERVICE: Wrench,
    NOTICE: Megaphone,
    EVENT: CalendarDays,
} as const;

function preview(value: string, max: number) {
    const text = Array.from(value);
    return text.length > max ? `${text.slice(0, max - 1).join("")}…` : value;
}

const subscribeToOrigin = () => () => {};
const getOrigin = () => window.location.origin;
const getServerOrigin = () => '';

export default function Feed({ data, error, page = 0 }: { data?: PageResponse<PublicationFeedItem>; error?: ActionFailure; page?: number }) {
    const router = useRouter();
    const origin = useSyncExternalStore(subscribeToOrigin, getOrigin, getServerOrigin);
    const [isPending, startTransition] = useTransition();
    const permissions = useUserStore((state) => state.permissions);
    const canCreate = {
        EVENT: hasPermission(permissions, "PUBLICATIONS", "EVENT_CREATE"),
        NOTICE: hasPermission(permissions, "PUBLICATIONS", "NOTICE_CREATE"),
        SERVICE: hasPermission(permissions, "PUBLICATIONS", "SERVICE_REQUEST_CREATE"),
    };

    const params = useSearchParams();
    const filtersResult = parsePublicationFeedFilters(params);
    const filters = filtersResult.success ? filtersResult.data : {};
    const { type, publishedFrom, publishedTo } = filters;
    const canCreateCurrentType = type ? canCreate[type] : Object.values(canCreate).some(Boolean);
    const creationType = type && canCreate[type] ? type : undefined;
    const creationLabel = creationType
        ? feedTypes[creationType].label.toLocaleLowerCase("pt-BR")
        : "publicação";

    const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

    const filterNavRef = useRef<HTMLElement>(null);
    const [showFilterHint, setShowFilterHint] = useState(false);
    const [periodOpen, setPeriodOpen] = useState(false);

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

    const failure = error ? { message: error.message, restricted: [401, 402, 403, 404].includes(error.status ?? 0) } : publicationReadError(undefined);
    const publications = error || !filtersResult.success ? [] : data?.content ?? [];
    function refreshFeed() { startTransition(() => router.refresh()); }
    function publicationHref(id: number) {
        const search = params.toString();
        return `/feed/${id}${search ? `?${search}` : ''}`;
    }
    function openPublication(id: number) { router.push(publicationHref(id), { scroll: false }); }
    function changePage(next: number) {
        const search = new URLSearchParams(params.toString());
        search.set('page', String(next));
        startTransition(() => router.push(`/feed?${search}`, { scroll: false }));
    }

    function applyFilters(next: PublicationFeedFilters) {
        const search = updatePublicationFeedFilters(new URLSearchParams(params.toString()), next);
        startTransition(() => router.replace(`/feed${search.size ? `?${search}` : ''}`, { scroll: false }));
    }

    function filterType(next?: 'NOTICE' | 'EVENT' | 'SERVICE') {
        const search = new URLSearchParams(params.toString());
        search.delete('type');
        if (next) search.set('type', next);
        for (const key of ['publication', 'page', 'size']) search.delete(key);
        startTransition(() => router.replace(`/feed${search.size ? `?${search}` : ''}`, { scroll: false }));
    }

    function openCreatePublication() {
        const search = new URLSearchParams(params.toString());
        if (creationType) search.set('type', creationType);
        router.push(`/feed/new${search.size ? `?${search}` : ''}`, { scroll: false });
    }

    return (
        <div tabIndex={-1} data-publication-return className="min-h-full w-full px-3 py-4 focus:outline-none md:px-6 md:py-6">
            <div className="mx-auto grid w-full min-w-0 max-w-7xl grid-cols-1 gap-5 md:gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
                <div className="flex w-full min-w-0 flex-col gap-5 md:gap-6">
                        <>
                            <h1 tabIndex={-1} className="sr-only">Mural do clube</h1>

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
                                            className={`cursor-pointer flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-800 md:flex-1 md:shrink ${!type
                                                    ? "bg-j-blue-800 text-j-white shadow-sm"
                                                    : "text-j-gray-600 hover:bg-j-gray-100"
                                                }`}
                                        >
                                            <Newspaper size={17} aria-hidden="true" />
                                            Tudo
                                        </button>

                                        {(["SERVICE", "NOTICE", "EVENT"] as const).map(
                                            (key) => {
                                                const Icon = publicationFilterIcons[key];

                                                return (
                                                    <button
                                                        key={key}
                                                        type="button"
                                                        onClick={() => filterType(key)}
                                                        aria-pressed={type === key}
                                                        className={`cursor-pointer flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-800 md:flex-1 md:shrink ${type === key
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

                                    <span
                                        id="feed-filter-swipe-hint"
                                        className="sr-only"
                                    >
                                        Deslize horizontalmente para ver mais tipos
                                        de publicação.
                                    </span>

                                    {showFilterHint && (
                                        <div
                                            aria-hidden="true"
                                            className="pointer-events-none absolute inset-y-0 right-0 flex items-center rounded-r-2xl bg-gradient-to-l from-j-white via-j-white/95 to-transparent pl-5 pr-2 md:hidden"
                                        >
                                            <span className="inline-flex items-center gap-0.5 rounded-full bg-j-white/90 py-1 pl-2 pr-1 text-[10px] font-bold text-j-blue-700 shadow-sm">
                                                Deslize <ChevronRight size={14} />
                                            </span>
                                        </div>
                                    )}

                                </div>

                                <DialogTrigger isOpen={periodOpen} onOpenChange={setPeriodOpen}>
                                    <AriaButton aria-label="Filtrar por período" className={`flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-input-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-input-border-focus ${publishedFrom || publishedTo ? 'bg-button-primary-bg text-button-primary-text' : 'bg-background text-primary hover:bg-background-tertiary'}`}><CalendarDays size={21} aria-hidden="true" /></AriaButton>
                                    <Popover placement="bottom end" className="z-[100] w-[min(38rem,calc(100vw-2rem))] outline-none"><Dialog aria-label="Filtrar publicações por período" className="outline-none"><FeedPeriodFilters publishedFrom={params.get('publishedFrom') ?? undefined} publishedTo={params.get('publishedTo') ?? undefined} onApply={period => { applyFilters({ type, ...period }); setPeriodOpen(false); }} /></Dialog></Popover>
                                </DialogTrigger>
                                {canCreateCurrentType && (
                                    <button
                                        type="button"
                                        aria-label={`Criar ${creationLabel}`}
                                        title={`Criar ${creationLabel}`}
                                        onClick={openCreatePublication}
                                        className="cursor-pointer flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-j-yellow-300 text-j-blue-900 shadow-sm transition-transform hover:scale-105 hover:bg-j-yellow-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-j-blue-800"
                                    >
                                        <Plus
                                            size={25}
                                            strokeWidth={2.8}
                                            aria-hidden="true"
                                        />
                                    </button>
                                )}
                            </div>

                            <Button disabled={!filtersResult.success || isPending} onClick={refreshFeed}>Atualizar publicações</Button>
                            {!filtersResult.success ? <div role="alert" className="rounded-xl bg-j-white p-4 text-j-gray-700"><p>Revise os filtros da URL. Use um tipo válido e instantes UTC com início anterior ou igual ao fim.</p><Button onClick={() => applyFilters({})}>Limpar filtros</Button></div> : isPending && !data ? (
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
                            ) : !!error && !publications.length ? (
                                <div
                                    role="alert"
                                    className="rounded-2xl border border-red-200 bg-j-white p-6"
                                >
                                    <p className="text-sm text-input-error-text">
                                        {failure.message}
                                    </p>

                                    <Button
                                        className="mt-4"
                                        onClick={refreshFeed}
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

                                    {(type || publishedFrom || publishedTo) && <><p>Nenhum resultado para os filtros selecionados.</p><Button onClick={() => applyFilters({})}>Limpar filtros</Button></>}
                                    <h2 className="mt-4 text-lg font-extrabold text-j-blue-800">
                                        {type
                                            ? `Nenhum ${feedTypes[
                                                type
                                            ].label.toLocaleLowerCase(
                                                "pt-BR"
                                            )
                                            } publicado ainda`
                                            : "Nenhuma publicação por aqui"}
                                    </h2>

                                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-j-gray-500">
                                        {type
                                            ? `As publicações de ${feedTypes[
                                                type
                                            ].plural.toLocaleLowerCase(
                                                "pt-BR"
                                            )
                                            } aparecem aqui quando forem publicadas.`
                                            : "Avisos, eventos e serviços do clube aparecem aqui quando forem publicados."}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-5">
                                    {publications.map((publication) => {
                                        const Icon = publicationFilterIcons[publication.type];
                                        const isEvent = publication.type === "EVENT";
                                        const canEdit = publication.type === "EVENT"
                                            ? hasPermission(permissions, "PUBLICATIONS", "EVENT_UPDATE") && hasPermission(permissions, "PUBLICATIONS", "EVENT_READ_ADMIN")
                                            : publication.type === "NOTICE" && hasPermission(permissions, "PUBLICATIONS", "NOTICE_UPDATE") && hasPermission(permissions, "PUBLICATIONS", "NOTICE_READ");

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

                                                        <div className="flex items-center gap-2">
                                                        <RelativeTime
                                                            value={
                                                                publication.publishedAt
                                                            }
                                                            className="text-xs text-j-gray-500"
                                                        />
                                                        {canEdit && <Link href={`/feed/${publication.id}/edit${params.size ? `?${params}` : ''}`} scroll={false} aria-label={`Editar: ${publication.title}`} className="cursor-pointer inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-sm font-bold text-j-blue-700 hover:bg-j-gray-100 focus-visible:outline-2 focus-visible:outline-j-blue-800"><Pencil size={15} aria-hidden="true" />Editar</Link>}
                                                        </div>
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
                                                            routedRegistration
                                                            compact
                                                        />
                                                    )}

                                                        <Link scroll={false} aria-label={`Ver publicação completa: ${publication.title}`} href={publicationHref(publication.id)} className="cursor-pointer self-start rounded text-sm font-bold text-j-blue-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-j-blue-800">Ver publicação completa<span className="sr-only">: {publication.title}</span></Link>

                                                    <div className="mt-auto border-t border-j-gray-200 pt-3">
                                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                                            {publication.type !== "SERVICE" && <FeedInteractions
                                                                publication={
                                                                    publication
                                                                }
                                                                onComments={() => openPublication(publication.id)}
                                                            />}

                                                            {isEvent && (
                                                                    <a
                                                                        href={`https://wa.me/?text=${encodeURIComponent(
                                                                            `Vamos nesse evento do Jeep Clube Tamoios? ${publication.title}\n${origin}/feed/${publication.id}`
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

                                                    {publication.type !== "SERVICE" && <PublicationCommentPreview
                                                        publicationId={
                                                            publication.id
                                                        }
                                                        count={
                                                            publication.commentCount
                                                        }
                                                        onOpen={() => openPublication(publication.id)}
                                                    />}
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}

                            {data && <nav aria-label="Páginas do feed" className="flex gap-3">
                                {page > 0 && <Button disabled={isPending} onClick={() => changePage(page - 1)}>Publicações anteriores</Button>}
                                {!data.last && <Button disabled={isPending} onClick={() => changePage(page + 1)}>Próximas publicações</Button>}
                                <span role="status">Página {page + 1} de {Math.max(1, data.totalPages)}</span>
                            </nav>}
                        </>
                </div>
                <FeedSidebar />
            </div>
        </div>
    );
}
