"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ChevronRight, Megaphone, Users, Wrench } from "lucide-react";

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/common/button';
import { useUserStore } from '@/stores/userStore';
import { hasPermission } from '@/utils/permission/hasPermission';
import { feedDate, publicationReadError, publicationReadRetry } from './feedDisplay';
import { Avatar } from "@/components/common/avatar";

import { listPublicationFeedAction } from "@/server/actions/publications/feed";
import { getMediaImageUrl } from "@/utils/media/imageUrl";
import { publicationPlainText } from "@/utils/publications/content";
import type { PublicationFeedItem } from "@/schemas/publications/feed";

function SideCard({ title, icon: Icon, href, children }: {
    title: string;
    icon: typeof CalendarDays;
    href?: string;
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
    const canRead = hasPermission(permissions, 'PUBLICATIONS', 'FEED_READ');
    const canDetail = hasPermission(permissions, 'PUBLICATIONS', 'PUBLICATION_READ');
    const params = useSearchParams();
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
    function detailHref(id: number) {
        const search = new URLSearchParams(params.toString());
        search.set('publication', String(id));
        return `/feed?${search}`;
    }
    const eventsQuery = useQuery({
        queryKey: ["publications", "feed-sidebar", { type: "EVENT", page: 0, size: 48 }, permissions],
        queryFn: () => listPublicationFeedAction({ type: "EVENT", page: 0, size: 48 }),
        staleTime: 60_000,
        enabled: canRead,
        retry: publicationReadRetry,
    });
    const noticesQuery = useQuery({
        queryKey: ["publications", "feed-sidebar", { type: "NOTICE", page: 0, size: 3 }, permissions],
        queryFn: () => listPublicationFeedAction({ type: "NOTICE", page: 0, size: 3 }),
        staleTime: 60_000,
        enabled: canRead,
        retry: publicationReadRetry,
    });
    const events = (publicationReadError(eventsQuery.error).restricted ? [] : eventsQuery.data?.content ?? [])
        .filter((item): item is Extract<PublicationFeedItem, { type: "EVENT" }> => item.type === "EVENT" && item.details.status === "OPEN")
        .sort((a, b) => Date.parse(a.details.startsAt) - Date.parse(b.details.startsAt))
        .slice(0, 3);
    const notices = (publicationReadError(noticesQuery.error).restricted ? [] : noticesQuery.data?.content ?? []).filter((item): item is Extract<PublicationFeedItem, { type: "NOTICE" }> => item.type === "NOTICE");

    return (
        <aside aria-label="Informações do clube" className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
            <section className="overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm">
                <div className="bg-j-blue-900 p-5 text-j-white">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-j-yellow-300">Jeep Clube Tamoios</p>
                    <h2 className="mt-2 text-lg font-extrabold">A aventura continua por aqui</h2>
                    <p className="mt-1 text-sm text-white/75">Novidades, encontros e serviços para a nossa comunidade.</p>
                </div>
                <div className="grid grid-cols-2 divide-x divide-j-gray-200">
                    <Link href="/agenda" className="flex items-center justify-center gap-2 p-3 text-sm font-bold text-j-blue-800 hover:bg-j-gray-100"><CalendarDays size={16} />Agenda</Link>
                    <Link href="/servicos" className="flex items-center justify-center gap-2 p-3 text-sm font-bold text-j-blue-800 hover:bg-j-gray-100"><Wrench size={16} />Serviços</Link>
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
                                    <p className="line-clamp-2 text-sm font-bold text-j-blue-900">{canDetail ? <Link onClick={event => event.currentTarget.focus({ preventScroll: true })} href={detailHref(event.id)} className="cursor-pointer rounded hover:underline focus-visible:outline-2 focus-visible:outline-j-blue-800">{event.title}</Link> : event.title}</p>
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

            <SideCard title="Avisos recentes" icon={Megaphone} href="/avisos">
                {noticesQuery.isError ? <div role="alert" className="text-sm text-j-gray-600"><p>{publicationReadError(noticesQuery.error).message}</p><Button onClick={() => void noticesQuery.refetch()}>Tentar avisos novamente</Button></div> : noticesQuery.isPending ? <p className="text-sm text-j-gray-500">Carregando avisos...</p> : notices.length ? (
                    <ul className="space-y-3">
                        {notices.map((notice) => <li key={notice.id} className="border-b border-j-gray-100 pb-3 last:border-0 last:pb-0"><p className="text-sm font-bold text-j-blue-900">{canDetail ? <Link onClick={event => event.currentTarget.focus({ preventScroll: true })} href={detailHref(notice.id)} className="cursor-pointer rounded hover:underline focus-visible:outline-2 focus-visible:outline-j-blue-800">{notice.title}</Link> : notice.title}</p><p className="mt-1 line-clamp-2 text-xs leading-relaxed text-j-gray-600">{publicationPlainText(notice.content)}</p></li>)}
                    </ul>
                ) : <p className="text-sm text-j-gray-500">Nenhum aviso recente.</p>}
            </SideCard>

            <section className="rounded-2xl border border-j-gray-200 bg-j-white p-4 shadow-sm">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-j-blue-900"><Users size={17} aria-hidden="true" />Acesso rápido</h2>
                <div className="grid grid-cols-2 gap-2">
                    <Link href="/agenda" className="rounded-xl bg-j-gray-100 px-3 py-2.5 text-center text-xs font-bold text-j-blue-800 hover:bg-j-yellow-100">Minha agenda</Link>
                    <Link href="/servicos" className="rounded-xl bg-j-gray-100 px-3 py-2.5 text-center text-xs font-bold text-j-blue-800 hover:bg-j-yellow-100">Serviços do clube</Link>
                </div>
            </section>
        </aside>
    );
}
