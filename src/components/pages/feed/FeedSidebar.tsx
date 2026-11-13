"use client";

import Link from "next/link";
import Image from "next/image";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Cake, CalendarDays, ChevronRight, Megaphone } from "lucide-react";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/common/button';
import { useUserStore } from '@/stores/userStore';
import { feedDate, publicationReadError, publicationReadRetry } from './feedDisplay';
import { Avatar } from "@/components/common/avatar";

import { listPublicationFeedAction } from "@/server/actions/publications/feed";
import { getMediaImageUrl } from "@/utils/media/imageUrl";
import { publicationPlainText } from "@/utils/publications/content";
import type { PublicationFeedItem } from "@/schemas/publications/feed";
import { mergeFeedPages, nextFeedPage } from "@/utils/publications/infiniteFeed";

function birthdayDateLabel(value: Date) {
    const dateOnly = new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" }).format(dateOnly);
}

function SideCard({ title, icon: Icon, href, linkLabel, children }: {
    title: string;
    icon: typeof CalendarDays;
    href?: string;
    linkLabel?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-j-gray-200 bg-j-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-sm font-extrabold text-j-blue-900">
                    <Icon size={17} className="text-j-blue-800" aria-hidden="true" />{title}
                </h2>
                {href && <Link href={href} className="cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-j-blue-800 inline-flex items-center gap-1 text-xs font-bold text-j-blue-700 hover:underline">Ver todos <ChevronRight size={14} aria-hidden="true" /></Link>}
            </div>
            {children}
        </section>
    );
}

export function FeedSidebar() {
    const permissions = useUserStore(state => state.permissions);
    const params = useSearchParams();
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
    const [now] = useState(() => new Date());
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
    const noticesQuery = useQuery({
        queryKey: ["publications", "feed-sidebar", { type: "NOTICE", page: 0, size: 3 }, permissions],
        queryFn: () => listPublicationFeedAction({ type: "NOTICE", page: 0, size: 3 }),
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
        .slice(0, 3);
    const notices = (publicationReadError(noticesQuery.error).restricted ? [] : noticesQuery.data?.content ?? []).filter((item): item is Extract<PublicationFeedItem, { type: "NOTICE" }> => item.type === "NOTICE");

    return (
        <aside aria-label="Informações do clube" className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
            <section className="relative rounded-2xl border border-input-border bg-background shadow-sm">
                <div className="rounded-t-2xl bg-j-blue-900 p-5 text-j-white">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-j-yellow-300">Jeep Clube Tamoios</p>
                    <h2 className="mt-2 text-lg font-extrabold">A aventura continua por aqui</h2>
                    <p className="mt-1 text-sm text-white/75">Novidades, encontros e serviços para a nossa comunidade.</p>
                </div>
                <div className="p-4">
                    <h3 className="mb-3 text-sm font-bold capitalize text-primary">{new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(now)}</h3>
                    <div className="grid grid-cols-7 gap-1 text-center" aria-label="Calendário do mês">
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => <span key={index} aria-hidden="true" className="text-xs font-semibold text-secondary">{day}</span>)}
                        {Array.from({ length: new Date(now.getFullYear(), now.getMonth(), 1).getDay() }, (_, index) => <span key={`empty-${index}`} />)}
                        {Array.from({ length: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() }, (_, index) => {
                            const day = index + 1;
                            const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const dayEvents = allEvents.filter(event => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(event.details.startsAt)) === dateKey);
                            return <span key={day} aria-label={dayEvents.length ? `${day}: ${dayEvents.length} ${dayEvents.length === 1 ? 'evento' : 'eventos'}` : `${day}`} className="relative mx-auto flex size-9 items-center justify-center text-sm text-secondary">{day}{dayEvents.length > 0 && <span aria-hidden="true" className="absolute bottom-0.5 size-1.5 rounded-full bg-button-primary-bg ring-1 ring-input-border" />}</span>;
                        })}
                    </div>
                    {eventsQuery.isPending && <p role="status" className="mt-2 text-xs text-secondary">Carregando eventos...</p>}
                    {eventsQuery.isError && <p role="alert" className="mt-2 text-xs text-input-error-text">{publicationReadError(eventsQuery.error).message}</p>}
                    <Link href="/agenda" className="mt-3 inline-flex cursor-pointer items-center gap-1 text-sm font-bold text-primary underline focus-visible:outline-2 focus-visible:outline-input-border-focus">Veja mais <ChevronRight size={16} aria-hidden="true" /></Link>
                </div>
            </section>

            <SideCard title="Eventos em destaque" icon={CalendarDays} href="/agenda">
                {eventsQuery.isError ? <div role="alert" className="text-sm text-j-gray-600"><p>{publicationReadError(eventsQuery.error).message}</p><Button onClick={() => void eventsQuery.refetch()}>Tentar eventos novamente</Button></div> : eventsQuery.isPending ? <p className="text-sm text-j-gray-500">Carregando eventos...</p> : events.length ? (
                    <ul className="space-y-3">
                        {events.map((event) => {
                            const image = getMediaImageUrl(event.primaryImage?.storageKey);
                            const participants = event.details.participants ?? [];
                            const participantCount = event.details.registrationCount ?? participants.length;

                            return <li key={event.id} className="flex gap-3 border-b border-j-gray-100 pb-3 last:border-0 last:pb-0">
                                {image && !failedImages.has(image) ? <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-lg"><Image src={image} onError={() => setFailedImages(previous => new Set(previous).add(image))} alt="" fill unoptimized sizes="64px" className="object-cover" /></div> : <div className="flex h-14 w-16 shrink-0 items-center justify-center rounded-lg bg-j-blue-50 text-j-blue-700"><CalendarDays size={20} /></div>}
                                <div className="min-w-0 flex-1">
                                    <p className="line-clamp-2 text-sm font-bold text-j-blue-900"><Link onClick={event => event.currentTarget.focus({ preventScroll: true })} href={detailHref(event.id)} className="cursor-pointer rounded hover:underline focus-visible:outline-2 focus-visible:outline-j-blue-800">{event.title}</Link></p>
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
                ) : <p className="text-sm text-j-gray-500">Nenhum evento publicado no momento.</p>}
            </SideCard>

            <SideCard title="Aniversariantes do mês" icon={Cake} href="/agenda" linkLabel="Ver agenda">
                {birthdaysQuery.isPending ? <p role="status" className="text-sm text-j-gray-500">Carregando aniversariantes...</p> : birthdaysQuery.isError ? (
                    <div role="alert" className="text-sm text-j-gray-500">
                        <p>Não foi possível carregar os aniversariantes.</p>
                        <button type="button" disabled={birthdaysQuery.isFetching} onClick={() => void birthdaysQuery.refetch()} className="mt-2 cursor-pointer font-bold text-j-blue-700 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-800 disabled:cursor-not-allowed disabled:opacity-60">{birthdaysQuery.isFetching ? "Carregando..." : "Tentar novamente"}</button>
                    </div>
                ) : upcomingBirthdays.length ? (
                    <ul className="space-y-2">
                        {upcomingBirthdays.map((birthday) => <li key={birthday.id} className="flex items-baseline justify-between gap-3 border-b border-j-gray-100 pb-2 last:border-0 last:pb-0">
                            <span className="min-w-0 break-words text-sm font-bold text-j-blue-900">{birthday.name}</span>
                            <time dateTime={`${birthday.date.getFullYear()}-${String(birthday.date.getMonth() + 1).padStart(2, "0")}-${String(birthday.date.getDate()).padStart(2, "0")}`} className="shrink-0 text-xs text-j-gray-500">
                                {birthdayDateLabel(birthday.date)}
                            </time>
                        </li>)}
                    </ul>
                ) : <p className="text-sm text-j-gray-500">Nenhum próximo aniversário neste mês.</p>}
            </SideCard>

            <SideCard title="Avisos recentes" icon={Megaphone} href="/avisos">
                {noticesQuery.isError ? <div role="alert" className="text-sm text-j-gray-600"><p>{publicationReadError(noticesQuery.error).message}</p><Button onClick={() => void noticesQuery.refetch()}>Tentar avisos novamente</Button></div> : noticesQuery.isPending ? <p className="text-sm text-j-gray-500">Carregando avisos...</p> : notices.length ? (
                    <ul className="space-y-3">
                        {notices.map((notice) => <li key={notice.id} className="border-b border-j-gray-100 pb-3 last:border-0 last:pb-0"><p className="text-sm font-bold text-j-blue-900"><Link onClick={event => event.currentTarget.focus({ preventScroll: true })} href={detailHref(notice.id)} className="cursor-pointer rounded hover:underline focus-visible:outline-2 focus-visible:outline-j-blue-800">{notice.title}</Link></p><p className="mt-1 line-clamp-2 text-xs leading-relaxed text-j-gray-600">{publicationPlainText(notice.content)}</p></li>)}
                    </ul>
                ) : <p className="text-sm text-j-gray-500">Nenhum aviso recente.</p>}
            </SideCard>


        </aside>
    );
}
