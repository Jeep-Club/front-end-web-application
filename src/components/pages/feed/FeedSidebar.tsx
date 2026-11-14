"use client";

import Link from "next/link";
import Image from "next/image";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Cake, CalendarDays, ChevronRight, Plus, X } from "lucide-react";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/common/button';
import { legalLinks } from '@/components/common/legal-links';
import { useUserStore } from '@/stores/userStore';
import { useBirthdayUsers } from '@/hooks/useBirthdayUsers';
import { feedDate, publicationReadError, publicationReadRetry } from './feedDisplay';
import { Avatar } from "@/components/common/avatar";

import { listPublicationFeedAction } from "@/server/actions/publications/feed";
import { getMediaImageUrl } from "@/utils/media/imageUrl";
import type { PublicationFeedItem } from "@/schemas/publications/feed";
import { mergeFeedPages, nextFeedPage } from "@/utils/publications/infiniteFeed";
import { getUpcomingBirthdaysForMonth } from "@/utils/birthdays";

import { SidebarSkeleton } from "./FeedLoading";

function SideCard({ title, icon: Icon, href, linkLabel, onNavigate, children }: {
    title: string;
    icon: typeof CalendarDays;
    href?: string;
    linkLabel?: string;
    onNavigate?: () => void;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-j-gray-200 bg-j-white p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="flex min-w-0 items-center gap-2 whitespace-nowrap text-sm font-extrabold text-j-blue-900">
                    <Icon size={17} className="shrink-0 text-j-blue-800" aria-hidden="true" /><span>{title}</span>
                </h2>
                {href && <Link href={href} onClick={onNavigate} className="inline-flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap rounded text-xs font-bold text-j-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-j-blue-800">{linkLabel ?? "Ver todos"} <ChevronRight size={14} aria-hidden="true" /></Link>}
            </div>
            {children}
        </section>
    );
}

export function FeedSidebar({ canCreate, onCreate, mobileOpen, onCloseMobile, mobilePeriodFilter }: { canCreate: boolean; onCreate: React.MouseEventHandler<HTMLButtonElement>; mobileOpen: boolean; onCloseMobile: () => void; mobilePeriodFilter: React.ReactNode }) {
    const permissions = useUserStore(state => state.permissions);
    const params = useSearchParams();
    const birthdayMonth = new Date().getMonth() + 1;
    const birthdaysQuery = useBirthdayUsers(birthdayMonth);
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
    function detailHref(id: number) {
        const search = new URLSearchParams(params.toString());
        search.set('publication', String(id));
        return `/feed?${search}`;
    }
    const eventsQuery = useInfiniteQuery({
        queryKey: ["publications", "feed-sidebar", { type: "EVENT", page: 0, size: 48 }, permissions],
        queryFn: ({ pageParam }) => listPublicationFeedAction({ type: "EVENT", page: pageParam, size: 48 }),
        initialPageParam: 0, getNextPageParam: nextFeedPage,
        staleTime: 60_000,
        retry: publicationReadRetry,
    });
    const { hasNextPage, isFetchingNextPage, isError, fetchNextPage } = eventsQuery;
    const pageCount = eventsQuery.data?.pages.length ?? 0;
    useEffect(() => {
        if (hasNextPage && !isFetchingNextPage && !isError) void fetchNextPage();
    }, [hasNextPage, isFetchingNextPage, isError, fetchNextPage, pageCount]);
    const allEvents = publicationReadError(eventsQuery.error).restricted ? [] : mergeFeedPages(eventsQuery.data?.pages ?? []).filter((item): item is Extract<PublicationFeedItem, { type: "EVENT" }> => item.type === "EVENT");
    const events = allEvents
        .filter((item): item is Extract<PublicationFeedItem, { type: "EVENT" }> => item.type === "EVENT" && item.details.status === "OPEN")
        .sort((a, b) => Date.parse(a.details.startsAt) - Date.parse(b.details.startsAt))
        .slice(0, 1);
    const birthdays = getUpcomingBirthdaysForMonth(
        birthdaysQuery.data ?? [],
        new Date(),
        birthdaysQuery.data?.length ?? 0,
    );

    return (
        <>
        <button
            type="button"
            aria-label="Fechar painel lateral"
            tabIndex={mobileOpen ? 0 : -1}
            onClick={onCloseMobile}
            className={`fixed inset-x-0 top-14 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-[92] cursor-pointer bg-black/60 transition-[opacity,visibility] duration-300 ease-in-out motion-reduce:transition-none lg:hidden ${mobileOpen ? "visible opacity-100" : "invisible pointer-events-none opacity-0"}`}
        />
        <aside
            id="tour-feed-sidebar"
            role={mobileOpen ? "dialog" : undefined}
            aria-modal={mobileOpen || undefined}
            aria-label="Informações do clube"
            className={`flex flex-col gap-3 max-lg:fixed max-lg:right-0 max-lg:top-14 max-lg:bottom-[calc(3.5rem+env(safe-area-inset-bottom))] max-lg:z-[93] max-lg:w-[min(88vw,20rem)] max-lg:gap-0 max-lg:overflow-hidden max-lg:bg-background max-lg:text-primary max-lg:shadow-2xl max-lg:transition-[translate,visibility] max-lg:duration-300 max-lg:ease-in-out motion-reduce:transition-none lg:sticky lg:top-6 lg:self-start ${mobileOpen ? "max-lg:visible max-lg:translate-x-0" : "max-lg:invisible max-lg:pointer-events-none max-lg:translate-x-full"}`}
        >
            <header className="flex min-h-16 shrink-0 items-center justify-between gap-2 border-b border-j-gray-200 bg-background px-4 py-3 lg:hidden">
                <div className="min-w-0"><h2 className="font-extrabold text-j-blue-900">Painel do clube</h2><p className="text-xs text-j-gray-500">Eventos e aniversariantes</p></div>
                <button type="button" aria-label="Fechar painel lateral" onClick={onCloseMobile} className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-j-gray-100 text-j-gray-600 shadow-sm transition-colors hover:bg-j-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-800"><X size={20} aria-hidden="true" /></button>
            </header>
            <div className="flex min-h-0 flex-col gap-3 max-lg:flex-1 max-lg:overflow-y-auto max-lg:overscroll-contain max-lg:p-4">
            <SideCard title="Eventos" icon={CalendarDays} href="/agenda" onNavigate={onCloseMobile}>
                {eventsQuery.isError ? <div role="alert" className="text-sm text-j-gray-600"><p>{publicationReadError(eventsQuery.error).message}</p><Button onClick={() => void eventsQuery.refetch()}>Tentar eventos novamente</Button></div> : eventsQuery.isPending ? <SidebarSkeleton label="Carregando eventos..." variant="event" /> : events.length ? (
                    <ul className="space-y-3">
                        {events.map((event) => {
                            const image = getMediaImageUrl(event.primaryImage?.storageKey);
                            const participants = event.details.participants ?? [];
                            const participantCount = event.details.registrationCount ?? participants.length;

                                            return <li key={event.id} className="flex gap-3 border-b border-j-gray-100 pb-3 last:border-0 last:pb-0">
                                {image && !failedImages.has(image) ? <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-lg"><Image src={image} onError={() => setFailedImages(previous => new Set(previous).add(image))} alt="" fill unoptimized sizes="64px" className="object-cover" /></div> : <div className="flex h-14 w-16 shrink-0 items-center justify-center rounded-lg bg-j-blue-50 text-j-blue-700"><CalendarDays size={20} /></div>}
                                <div className="min-w-0 flex-1">
                                    <p className="line-clamp-2 text-sm font-bold text-j-blue-900"><Link onClick={event => { event.currentTarget.focus({ preventScroll: true }); onCloseMobile(); }} href={detailHref(event.id)} className="cursor-pointer rounded hover:underline focus-visible:outline-2 focus-visible:outline-j-blue-800">{event.title}</Link></p>
                                    <p className="mt-1 text-xs text-j-gray-500">{feedDate(event.details.startsAt)}</p>
                                    {participantCount > 0 && <div className="mt-2 flex items-center gap-2" aria-label={`${participantCount} ${participantCount === 1 ? "participante inscrito" : "participantes inscritos"}`}>
                                        <div className="flex shrink-0 items-center" aria-hidden="true">
                                            {participants.slice(0, 4).map((participant, index) => {
                                                const photo = getMediaImageUrl(participant.profilePhotoStorageKey ?? participant.profilePhotoUrl ?? participant.photoStorageKey ?? participant.photoUrl);
                                                const initials = participant.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => Array.from(part)[0]?.toLocaleUpperCase("pt-BR")).join("");
                                                return <span key={participant.id ?? participant.userId ?? `${participant.name}-${index}`} className={index ? "-ml-2" : ""} title={participant.name}>
                                                    {photo ? <Avatar src={photo} alt="" className="h-7 w-7 border-2 border-j-white bg-j-gray-200" /> : <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-j-white bg-j-blue-800 text-[9px] font-bold text-j-white">{initials || "A"}</span>}
                                                </span>;
                                            })}
                                        </div>
                                        <p className="truncate text-[11px] text-j-gray-500">
                                            {participants.length ? `${participants.slice(0, 2).map((participant) => participant.name.split(" ")[0]).join(", ")}${participantCount > 2 ? ` +${participantCount - Math.min(participants.length, 2)}` : ""}` : `${participantCount} ${participantCount === 1 ? "inscrito" : "inscritos"}`}
                                        </p>
                                    </div>}
                                </div>

                            </li>;
                        })}
                    </ul>
                ) : <p className="text-sm text-j-gray-500">Nenhum evento publicado.</p>}
            </SideCard>

            <SideCard title="Aniversários" icon={Cake} href="/agenda" linkLabel="Agenda" onNavigate={onCloseMobile}>
                {birthdaysQuery.isPending ? (
                    <SidebarSkeleton label="Carregando aniversariantes..." variant="birthday" />
                ) : birthdaysQuery.isError ? (
                    <div role="alert" className="text-sm text-j-gray-600">
                        <p>Não foi possível carregar os aniversariantes.</p>
                        <Button className="mt-2" onClick={() => void birthdaysQuery.refetch()}>Tentar novamente</Button>
                    </div>
                ) : birthdays.length ? (
                    <ul className="space-y-2">
                        {birthdays.slice(0, 2).map((birthday) => {
                            const month = birthday.birthMonth ?? birthdayMonth;
                            const day = birthday.birthDay ?? 1;
                            const birthdayDate = birthday.date;
                            const dateLabel = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(birthdayDate);

                            return (
                                <li key={birthday.id} className="flex min-w-0 items-center justify-between gap-3 text-sm">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <span aria-hidden="true" className="size-8 shrink-0 rounded-full bg-j-gray-100" />
                                        <span className="truncate font-semibold text-j-gray-700">{birthday.name.trim().split(/\s+/).filter((_, index, parts) => index === 0 || index === parts.length - 1).join(" ")}</span>
                                    </div>
                                    <time dateTime={`2000-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`} className="shrink-0 rounded-lg bg-j-blue-50 px-2 py-1 text-xs font-bold text-j-blue-800">
                                        {dateLabel}
                                    </time>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="text-sm text-j-gray-500">Nenhum aniversário neste mês.</p>
                )}
            </SideCard>


            {mobileOpen && (
                <section className="shrink-0 lg:hidden" aria-labelledby="feed-mobile-period-title">
                    <h3 id="feed-mobile-period-title" className="mb-2 text-sm font-extrabold text-j-blue-900">Filtrar por período</h3>
                    {mobilePeriodFilter}
                </section>
            )}
            {canCreate && (
                <button
                    id="tour-feed-create-btn"
                    type="button"
                    aria-haspopup="dialog"
                    onClick={onCreate}
                    className="hidden min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-j-yellow-300 px-6 text-base font-extrabold text-j-blue-900 shadow-sm transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-j-yellow-400 hover:shadow-md active:translate-y-0 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-800 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 lg:flex"
                >
                    <Plus size={18} aria-hidden="true" />
                    Postar
                </button>
            )}
            <nav aria-label="Informações legais, contato e equipe" className="mt-1 hidden w-full text-[10px] text-secondary lg:block">
                <div className="flex flex-nowrap items-center justify-start gap-1 whitespace-nowrap">
                    {legalLinks.map(({ href, label }) => (
                        <Link key={href} href={href} className="legal-link shrink-0 whitespace-nowrap rounded-sm underline-offset-4 transition-colors duration-200 ease-out hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-j-yellow-300 motion-reduce:transition-none">
                            {label}
                        </Link>
                    ))}
                </div>
            </nav>

            </div>
        </aside>
        </>
    );
}
