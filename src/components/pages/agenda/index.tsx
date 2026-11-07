"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, List, MessageCircle, X } from "lucide-react";
import { Button, ButtonIcon } from "@/components/common/button";
import { listPublicationFeedAction } from "@/server/actions/publications/feed";
import { useUserStore } from "@/stores/userStore";
import { useModal } from "@/providers/ModalProvider";
import { hasPermission } from "@/utils/permission/hasPermission";
import { getMediaImageUrl } from "@/utils/media/imageUrl";
import { publicationPlainText } from "@/utils/publications/content";
import { nextFeedPage, mergeFeedPages } from "@/utils/publications/infiniteFeed";
import type { PublicationFeedItem } from "@/schemas/publications/feed";
import { EventParticipation } from "@/components/pages/feed/EventParticipation";
import { PublicationDetailModal } from "@/components/pages/feed/PublicationDetailModal";
import { feedDate } from "@/components/pages/feed/feedDisplay";
import styles from "./AgendaPage.module.css";

type EventItem = Extract<PublicationFeedItem, { type: "EVENT" }>;

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const EVENT_STATUS_LABELS = {
    OPEN: "Inscrições abertas",
    IN_PROGRESS: "Em andamento",
    FINISHED: "Encerrado",
    CANCELLED: "Cancelado",
} as const;

function calendarDateKey(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function eventDateKey(value: string) {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date(value));
    const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
    return `${part("year")}-${part("month")}-${part("day")}`;
}

function monthLabel(date: Date) {
    return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "America/Sao_Paulo" }).format(date);
}

function longDateLabel(date: Date) {
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "full", timeZone: "America/Sao_Paulo" }).format(date);
}

function makeCalendarDays(month: Date) {
    const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const mondayFirstOffset = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cellCount = Math.ceil((mondayFirstOffset + daysInMonth) / 7) * 7;
    return Array.from({ length: cellCount }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index - mondayFirstOffset + 1));
}

function EventSummary({ event }: { event: EventItem }) {
    const { setContent, setOpen, setClose } = useModal();
    const permissions = useUserStore((state) => state.permissions);
    const canReadDetail = hasPermission(permissions, "PUBLICATIONS", "PUBLICATION_READ");
    const imageUrl = getMediaImageUrl(event.primaryImage?.storageKey);
    const excerpt = publicationPlainText(event.content).trim();

    function openDetails() {
        setContent(<PublicationDetailModal publicationId={event.id} />);
        setOpen();
    }

    return <section role="dialog" aria-modal="true" aria-labelledby="agenda-event-title" className="relative max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-3xl bg-j-white shadow-2xl">
        <ButtonIcon type="button" aria-label="Fechar resumo do evento" onClick={setClose} className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-2 text-white backdrop-blur hover:bg-black/70"><X size={19} /></ButtonIcon>
        <div className="relative h-36 overflow-hidden bg-j-blue-800 sm:h-44">
            {imageUrl && <Image src={imageUrl} alt="" fill unoptimized sizes="(min-width: 640px) 512px, 100vw" className="object-cover opacity-75" />}
            <div className="absolute inset-0 bg-gradient-to-t from-j-blue-950/90 via-j-blue-950/25 to-transparent" />
            <span className="absolute bottom-4 left-5 inline-flex items-center gap-2 rounded-full bg-j-yellow-300 px-3 py-1.5 text-xs font-extrabold text-j-blue-900"><CalendarDays size={14} aria-hidden="true" />Evento do clube</span>
        </div>
        <div className="flex flex-col gap-4 p-5 sm:p-6">
            <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-j-gray-500"><Clock3 size={15} aria-hidden="true" />{feedDate(event.details.startsAt)}<span aria-hidden="true">·</span><span>{EVENT_STATUS_LABELS[event.details.status]}</span></div>
                <h2 id="agenda-event-title" className="mt-2 break-words text-xl font-extrabold text-j-blue-800">{event.title}</h2>
                {excerpt && <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-j-gray-600">{excerpt}</p>}
            </div>
            <div className="flex items-center gap-2 text-sm text-j-gray-500"><MessageCircle size={16} aria-hidden="true" />{event.commentCount} {event.commentCount === 1 ? "comentário" : "comentários"}</div>
            <EventParticipation eventId={event.id} eventStatus={event.details.status} charges={event.details.charges} compact />
            {canReadDetail && <Button type="button" onClick={openDetails} className="w-full">Ver evento e comentários</Button>}
        </div>
    </section>;
}

export default function AgendaPage() {
    const permissions = useUserStore((state) => state.permissions);
    const canRead = permissions.some((module) => module.module === "PUBLICATIONS" && module.actions.includes("FEED_READ"));
    const { setContent, setOpen } = useModal();
    const [month, setMonth] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });
    const [monthDirection, setMonthDirection] = useState<"forward" | "back">("forward");

    const [mobileView, setMobileView] = useState<"calendar" | "agenda">("agenda");

    const today = useMemo(() => calendarDateKey(new Date()), []);
    const query = useInfiniteQuery({
        queryKey: ["publications", "agenda", permissions],
        queryFn: ({ pageParam }) => listPublicationFeedAction({ type: "EVENT", page: pageParam, size: 48 }),
        initialPageParam: 0,
        getNextPageParam: nextFeedPage,
        enabled: canRead,
    });
    const { hasNextPage, isFetchingNextPage, isError, fetchNextPage } = query;
    const pageCount = query.data?.pages.length ?? 0;
    const events = useMemo(() => mergeFeedPages(query.data?.pages ?? []).filter((item): item is EventItem => item.type === "EVENT"), [query.data]);
    const days = useMemo(() => makeCalendarDays(month), [month]);
    const eventsByDate = useMemo(() => {
        const grouped = new Map<string, EventItem[]>();
        for (const event of events) {
            const key = eventDateKey(event.details.startsAt);
            const group = grouped.get(key) ?? [];
            group.push(event);
            grouped.set(key, group);
        }
        for (const group of grouped.values()) group.sort((a, b) => Date.parse(a.details.startsAt) - Date.parse(b.details.startsAt));
        return grouped;
    }, [events]);

    useEffect(() => {
        if (!hasNextPage || isFetchingNextPage || isError) return;
        void fetchNextPage();
    }, [hasNextPage, isFetchingNextPage, isError, fetchNextPage, pageCount]);

    function openDayEvents(dayEvents: EventItem[], date: Date) {
        if (dayEvents.length === 1) {
            setContent(<EventSummary event={dayEvents[0]} />);
            setOpen();
            return;
        }
        setContent(<AgendaDayEvents events={dayEvents} date={date} />);
        setOpen();
    }

    function moveMonth(offset: number) {
        setMonthDirection(offset > 0 ? "forward" : "back");
        setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
    }

    function goToToday() {
        const now = new Date();
        setMonthDirection(now >= month ? "forward" : "back");
        setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    }

    const monthEvents = days.flatMap((day) => {
        if (day.getMonth() !== month.getMonth()) return [];
        const dayEvents = eventsByDate.get(calendarDateKey(day)) ?? [];
        return dayEvents.length ? [{ day, events: dayEvents }] : [];
    });

    return <div className="min-h-full w-full p-3 pb-8 md:p-5">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
            <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-j-gray-400 md:text-sm">
                <Link href="/feed" className="transition-colors hover:text-j-blue-700">Home</Link>
                <ChevronRight size={14} aria-hidden="true" />
                <span className="font-semibold text-j-blue-800">Agenda</span>
            </nav>
            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                    <h1 className="mt-1 text-2xl font-extrabold text-j-gray-700 md:text-3xl">Agenda de eventos</h1>
                    <p className="mt-1 max-w-xl text-sm text-j-gray-500">Veja o que vem por aí e abra um evento para conferir os detalhes.</p>
                </div>
                <div className="flex w-full items-center justify-between gap-1 rounded-2xl border border-j-gray-200 bg-j-white p-1.5 shadow-sm sm:w-auto sm:gap-2">
                    <button type="button" aria-label="Mês anterior" onClick={() => moveMonth(-1)} className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl text-j-gray-600 transition-colors hover:bg-j-gray-100 focus-visible:outline-2 focus-visible:outline-j-blue-800"><ChevronLeft size={20} /></button>
                    <h2 aria-live="polite" className="min-w-0 flex-1 text-center text-sm font-extrabold capitalize text-j-blue-800 sm:min-w-36">{monthLabel(month)}</h2>
                    <button type="button" aria-label="Próximo mês" onClick={() => moveMonth(1)} className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl text-j-gray-600 transition-colors hover:bg-j-gray-100 focus-visible:outline-2 focus-visible:outline-j-blue-800"><ChevronRight size={20} /></button>
                    <button type="button" onClick={goToToday} className="ml-1 min-h-10 shrink-0 cursor-pointer rounded-xl bg-j-gray-100 px-3 text-xs font-bold text-j-gray-600 transition-colors hover:bg-j-gray-200 focus-visible:outline-2 focus-visible:outline-j-blue-800">Hoje</button>
                </div>
            </header>

            {canRead && <div className="grid grid-cols-2 gap-1 rounded-2xl border border-j-gray-200 bg-j-gray-100/80 p-1 md:hidden" role="group" aria-label="Forma de visualizar a agenda">
                <button type="button" aria-pressed={mobileView === "calendar"} onClick={() => setMobileView("calendar")} className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition-[background-color,color,box-shadow] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-800 ${mobileView === "calendar" ? "bg-j-white text-j-blue-800 shadow-sm" : "text-j-gray-600 hover:bg-j-white/70"}`}>
                    <CalendarDays size={17} aria-hidden="true" />Calendário
                </button>
                <button type="button" aria-pressed={mobileView === "agenda"} onClick={() => setMobileView("agenda")} className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition-[background-color,color,box-shadow] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-800 ${mobileView === "agenda" ? "bg-j-white text-j-blue-800 shadow-sm" : "text-j-gray-600 hover:bg-j-white/70"}`}>
                    <List size={17} aria-hidden="true" />Lista de eventos
                </button>
            </div>}

            {!canRead ? <div role="status" className="rounded-2xl border border-j-gray-200 bg-j-white p-6 text-sm text-j-gray-600">Seu usuário não possui permissão para ver os eventos.</div>

                : query.isLoading ? <div role="status" aria-label="Carregando agenda" className="h-56 animate-pulse rounded-3xl bg-j-gray-200 md:h-[32rem]" />

                    : query.isError && !events.length ? <div role="alert" className="rounded-2xl border border-red-200 bg-j-white p-6"><p className="text-sm text-red-600">{query.error.message}</p><Button className="mt-3" onClick={() => void query.refetch()}>Tentar novamente</Button></div>
                        : <>
                        <section aria-label="Calendário mensal" className="hidden overflow-hidden rounded-3xl border border-j-gray-200 bg-j-white shadow-sm md:block">
                            <div key={calendarDateKey(month)} data-direction={monthDirection} className={styles.monthTransition}>

                            <div className="grid grid-cols-7 gap-px border-b border-j-gray-200 bg-j-gray-200">
                                {WEEKDAYS.map((day) => <div key={day} className="bg-j-gray-100/80 py-3 text-center text-[11px] font-extrabold uppercase tracking-wide text-j-gray-500 sm:text-xs">{day}</div>)}

                            </div>
                            <div className="grid grid-cols-7 gap-px bg-j-gray-200">
                                {days.map((day) => {
                                    const key = calendarDateKey(day);
                                    const dayEvents = eventsByDate.get(key) ?? [];
                                    const event = dayEvents[0];
                                    const imageUrl = getMediaImageUrl(event?.primaryImage?.storageKey);
                                    const inMonth = day.getMonth() === month.getMonth();
                                    const isToday = key === today;
                                    const eventLabel = dayEvents.length === 1 ? event.title : `${dayEvents.length} eventos`;

                                    return <div key={key} className={`relative min-h-28 p-1.5 lg:min-h-32 lg:p-2 ${inMonth ? "bg-j-white" : "bg-j-gray-100/70"}`}>
                                        {dayEvents.length > 0 ? <button type="button" onClick={() => openDayEvents(dayEvents, day)} aria-label={`${longDateLabel(day)}: ${eventLabel}`} className={`group relative flex h-full min-h-24 w-full cursor-pointer flex-col overflow-hidden rounded-xl p-2 text-left transition-[transform,box-shadow,ring-color] duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-j-blue-800 lg:min-h-28 ${isToday ? "ring-2 ring-j-yellow-400" : ""}`}>
                                            {imageUrl ? <Image src={imageUrl} alt="" fill unoptimized sizes="(min-width: 768px) 14vw, 14vw" className="object-cover opacity-70 transition-transform duration-300 group-hover:scale-105" /> : <div className="absolute inset-0 bg-gradient-to-br from-j-yellow-100 to-j-yellow-300" />}
                                            {imageUrl && <div className="absolute inset-0 bg-gradient-to-br from-j-blue-950/30 via-transparent to-j-blue-950/65" />}
                                            <span className={`relative z-[1] flex size-8 items-center justify-center rounded-lg text-sm font-black shadow-sm ${imageUrl ? "bg-j-yellow-300 text-j-blue-950" : "bg-j-white/90 text-j-blue-900"}`}>{day.getDate()}</span>
                                            <span className={`relative z-[1] mt-auto line-clamp-2 w-full text-xs font-extrabold leading-tight ${imageUrl ? "text-white drop-shadow" : "text-j-blue-900"}`}>{event.title}</span>
                                            {dayEvents.length > 1 && <span className="absolute right-2 top-2 z-[1] rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-extrabold text-j-blue-900 shadow">+{dayEvents.length - 1}</span>}
                                        </button> : <div className={`flex h-full min-h-24 items-start rounded-xl p-2 lg:min-h-28 ${isToday ? "bg-j-yellow-100/70" : ""}`}><span className={`flex size-8 items-center justify-center rounded-lg text-sm font-bold ${inMonth ? "text-j-gray-700" : "text-j-gray-400"} ${isToday ? "bg-j-yellow-300 text-j-blue-950" : ""}`}>{day.getDate()}</span></div>}

                                    </div>;
                                })}
                            </div>
                            </div>
                            {query.isFetchingNextPage && <p role="status" className="border-t border-j-gray-200 px-4 py-3 text-center text-xs text-j-gray-500">Carregando mais eventos…</p>}
                            {query.isFetchNextPageError && <div role="alert" className="border-t border-j-gray-200 p-4 text-center"><p className="text-sm text-red-600">Não foi possível carregar todos os eventos.</p><Button className="mt-2" onClick={() => void query.fetchNextPage()}>Tentar novamente</Button></div>}
                            {!events.length && <p className="border-t border-j-gray-200 p-5 text-center text-sm text-j-gray-500">Não há eventos publicados neste calendário ainda.</p>}
                        </section>

                        <section aria-label="Calendário mensal" className={`overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm md:hidden ${mobileView === "calendar" ? "block" : "hidden"}`}>
                            <div key={`${calendarDateKey(month)}-${mobileView}`} data-direction={monthDirection} className={styles.monthTransition}>
                                <div className="grid grid-cols-7 gap-px border-b border-j-gray-200 bg-j-gray-200">
                                    {WEEKDAYS.map((day) => <div key={day} className="bg-j-gray-100/80 py-2 text-center text-[10px] font-extrabold uppercase tracking-wide text-j-gray-500">{day}</div>)}
                                </div>
                                <div className="grid grid-cols-7 gap-px bg-j-gray-200">
                                    {days.map((day) => {
                                        const key = calendarDateKey(day);
                                        const dayEvents = eventsByDate.get(key) ?? [];
                                        const inMonth = day.getMonth() === month.getMonth();
                                        const isToday = key === today;
                                        const eventCountLabel = dayEvents.length === 1 ? dayEvents[0].title : `${dayEvents.length} eventos`;
                                        const dateClass = `flex size-8 items-center justify-center rounded-xl text-sm font-bold ${isToday ? "bg-j-yellow-300 text-j-blue-950 shadow-sm" : inMonth ? "text-j-gray-700" : "text-j-gray-400"}`;
                                        return <div key={key} className={`flex min-h-12 flex-col items-center justify-start gap-1.5 p-1.5 ${inMonth ? "bg-j-white" : "bg-j-gray-100/70"}`}>
                                            {dayEvents.length ? <button type="button" onClick={() => openDayEvents(dayEvents, day)} aria-label={`${longDateLabel(day)}: ${eventCountLabel}`} className={`flex w-full cursor-pointer flex-col items-center gap-1 rounded-xl py-0.5 transition-colors hover:bg-j-yellow-100/70 focus-visible:outline-2 focus-visible:outline-j-blue-800 ${isToday ? "ring-1 ring-inset ring-j-yellow-400" : ""}`}>
                                                <span className={dateClass}>{day.getDate()}</span>
                                                <span aria-hidden="true" className="flex h-1.5 items-center justify-center gap-0.5">{dayEvents.slice(0, 3).map((event) => <span key={event.id} className="size-1.5 rounded-full bg-j-blue-700" />)}</span>
                                            </button> : <div className="flex w-full flex-col items-center gap-1 rounded-xl py-0.5"><span className={dateClass}>{day.getDate()}</span><span aria-hidden="true" className="h-1.5" /></div>}
                                        </div>;
                                    })}
                                </div>
                            </div>
                        </section>
                        <section aria-label="Eventos do mês" className={`flex flex-col gap-3 md:hidden ${mobileView === "agenda" ? "" : "hidden"}`}>
                            <div key={`${calendarDateKey(month)}-${mobileView}`} data-direction={monthDirection} className={`${styles.monthTransition} flex flex-col gap-3`}>

                                {monthEvents.length ? monthEvents.map(({ day, events: dayEvents }) => <article key={calendarDateKey(day)} className="overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm">
                                    <h3 className={`border-b border-j-gray-100 px-4 py-2.5 text-sm font-extrabold capitalize ${calendarDateKey(day) === today ? "bg-j-yellow-300/20 text-j-blue-900" : "bg-j-gray-100/70 text-j-blue-800"}`}>{longDateLabel(day)}</h3>
                                    <div className="flex flex-col gap-2 p-3">
                                        {dayEvents.map((event) => <button key={event.id} type="button" onClick={() => openDayEvents([event], day)} className="group flex min-h-20 w-full cursor-pointer items-center gap-3 overflow-hidden rounded-xl border border-j-gray-100 p-2 text-left transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-j-yellow-400 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-j-blue-800">
                                            <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-j-blue-800 sm:size-20">{event.primaryImage ? <Image src={getMediaImageUrl(event.primaryImage.storageKey)} alt="" fill unoptimized sizes="80px" className="object-cover transition-transform duration-300 group-hover:scale-105" /> : <CalendarDays className="absolute inset-0 m-auto text-j-yellow-300" size={24} />}</span>
                                            <span className="min-w-0 flex-1 py-1"><span className="block break-words text-sm font-extrabold text-j-blue-800">{event.title}</span><span className="mt-1 block text-xs text-j-gray-500">{feedDate(event.details.startsAt)}</span><span className="mt-1 block text-[11px] font-semibold text-j-gray-500">{EVENT_STATUS_LABELS[event.details.status]}</span></span>
                                            <ChevronRight size={18} aria-hidden="true" className="mr-1 shrink-0 text-j-gray-400 transition-transform group-hover:translate-x-0.5" />
                                        </button>)}
                                    </div>
                                </article>) : <div className="rounded-2xl border border-j-gray-200 bg-j-white px-5 py-8 text-center"><CalendarDays className="mx-auto text-j-gray-400" size={28} /><p className="mt-3 text-sm font-semibold text-j-gray-600">Não há eventos publicados neste mês.</p></div>}
                            </div>
                            {query.isFetchingNextPage && <p role="status" className="py-2 text-center text-xs text-j-gray-500">Carregando mais eventos…</p>}
                            {query.isFetchNextPageError && <div role="alert" className="rounded-2xl border border-red-200 bg-j-white p-4 text-center"><p className="text-sm text-red-600">Não foi possível carregar todos os eventos.</p><Button className="mt-2" onClick={() => void query.fetchNextPage()}>Tentar novamente</Button></div>}
                        </section>
                        </>}

            <p className="text-center text-xs text-j-gray-400">Selecione um dia com evento para conferir os detalhes.</p>

        </div>
    </div>;
}

function AgendaDayEvents({ events, date }: { events: EventItem[]; date: Date }) {
    const { setContent, setOpen, setClose } = useModal();
    return <section role="dialog" aria-modal="true" aria-labelledby="agenda-day-title" className="max-h-[85dvh] w-full max-w-xl overflow-y-auto rounded-3xl bg-j-white p-5 shadow-2xl sm:p-6">
        <header className="mb-4 flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-j-blue-700">{longDateLabel(date)}</p><h2 id="agenda-day-title" className="mt-1 text-xl font-extrabold text-j-blue-800">Eventos do dia</h2></div><ButtonIcon type="button" aria-label="Fechar eventos do dia" onClick={setClose} className="rounded-full bg-j-gray-100 p-2 text-j-gray-600 hover:bg-j-gray-200"><X size={19} /></ButtonIcon></header>
        <div className="flex flex-col gap-3">
            {events.map((event) => <button key={event.id} type="button" onClick={() => { setContent(<EventSummary event={event} />); setOpen(); }} className="flex items-center gap-3 rounded-2xl border border-j-gray-200 p-3 text-left transition-colors hover:border-j-yellow-400 hover:bg-j-gray-100 focus-visible:outline-2 focus-visible:outline-j-blue-800">
                <span className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-j-blue-800 text-j-yellow-300">{event.primaryImage ? <Image src={getMediaImageUrl(event.primaryImage.storageKey)} alt="" fill unoptimized sizes="64px" className="object-cover opacity-60" /> : <CalendarDays size={22} />}</span>
                <span className="min-w-0"><span className="block truncate font-bold text-j-blue-800">{event.title}</span><span className="mt-1 block text-xs text-j-gray-500">{feedDate(event.details.startsAt)}</span></span>
                <ChevronRight size={18} className="ml-auto shrink-0 text-j-gray-400" aria-hidden="true" />
            </button>)}
        </div>
    </section>;
}
