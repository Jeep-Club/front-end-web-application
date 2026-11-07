"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Cake, CalendarDays, ChevronRight, Megaphone, Plus } from "lucide-react";

import { CreatePublicationModal } from "@/components/pages/admin/gestao-publicacoes/CreatePublicationModal";
import { publicationCreationTypes } from "@/config/publicationCreation";
import { useModal } from "@/providers/ModalProvider";

import { listPublicationFeedAction } from "@/server/actions/publications/feed";
import { getMediaImageUrl } from "@/utils/media/imageUrl";
import { hasPermission } from "@/utils/permission/hasPermission";
import { publicationPlainText } from "@/utils/publications/content";
import { useUserStore } from "@/stores/userStore";
import type { PublicationFeedItem } from "@/schemas/publications/feed";

function dateLabel(value: string) {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Sao_Paulo",
    }).format(new Date(value));
}

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
                {href && <Link href={href} className="inline-flex items-center gap-1 text-xs font-bold text-j-blue-700 hover:underline">Ver todos <ChevronRight size={14} aria-hidden="true" /></Link>}
            </div>
            {children}
        </section>
    );
}

export function FeedSidebar() {
    const permissions = useUserStore((state) => state.permissions);
    const canCreate = publicationCreationTypes.some((entry) =>
        hasPermission(permissions, "PUBLICATIONS", entry.action)
    );
    const { setContent, setOpen } = useModal();
    const eventsQuery = useQuery({
        queryKey: ["publications", "feed-sidebar", "EVENT"],
        queryFn: () => listPublicationFeedAction({ type: "EVENT", page: 0, size: 48 }),
        staleTime: 60_000,
    });
    const noticesQuery = useQuery({
        queryKey: ["publications", "feed-sidebar", "NOTICE"],
        queryFn: () => listPublicationFeedAction({ type: "NOTICE", page: 0, size: 3 }),
        staleTime: 60_000,
    });
    const events = (eventsQuery.data?.content ?? [])
        .filter((item): item is Extract<PublicationFeedItem, { type: "EVENT" }> => item.type === "EVENT" && item.details.status !== "CANCELLED" && Date.parse(item.details.startsAt) >= Date.now())
        .sort((a, b) => Date.parse(a.details.startsAt) - Date.parse(b.details.startsAt))
        .slice(0, 3);
    const notices = (noticesQuery.data?.content ?? []).filter((item): item is Extract<PublicationFeedItem, { type: "NOTICE" }> => item.type === "NOTICE");

    return (
        <aside id="tour-feed-sidebar" aria-label="Informações do clube" className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
            <SideCard title="Próximos eventos" icon={CalendarDays} href="/agenda">
                {eventsQuery.isPending ? <p className="text-sm text-j-gray-500">Carregando eventos...</p> : events.length ? (
                    <ul className="space-y-3">
                        {events.map((event) => {
                            const image = getMediaImageUrl(event.primaryImage?.storageKey);

                            return <li key={event.id} className="flex gap-3 border-b border-j-gray-100 pb-3 last:border-0 last:pb-0">
                                {image ? <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-lg"><Image src={image} alt="" fill unoptimized sizes="64px" className="object-cover" /></div> : <div className="flex h-14 w-16 shrink-0 items-center justify-center rounded-lg bg-j-blue-50 text-j-blue-700"><CalendarDays size={20} /></div>}
                                <div className="min-w-0 flex-1">
                                    <p className="line-clamp-2 text-sm font-bold text-j-blue-900">{event.title}</p>
                                    <p className="mt-1 text-xs text-j-gray-500">{dateLabel(event.details.startsAt)}</p>
                                </div>

                            </li>;
                        })}
                    </ul>
                ) : <p className="text-sm text-j-gray-500">Nenhum evento publicado no momento.</p>}
            </SideCard>

            <SideCard title="Aniversariantes do mês" icon={Cake}>
                <p className="text-sm text-j-gray-500">
                    A listagem de aniversariantes está disponível apenas na área administrativa.
                </p>
            </SideCard>

            <SideCard title="Avisos recentes" icon={Megaphone} href="/avisos">
                {noticesQuery.isPending ? <p className="text-sm text-j-gray-500">Carregando avisos...</p> : notices.length ? (
                    <ul className="space-y-3">
                        {notices.map((notice) => <li key={notice.id} className="border-b border-j-gray-100 pb-3 last:border-0 last:pb-0"><p className="text-sm font-bold text-j-blue-900">{notice.title}</p><p className="mt-1 line-clamp-2 text-xs leading-relaxed text-j-gray-600">{publicationPlainText(notice.content)}</p></li>)}
                    </ul>
                ) : <p className="text-sm text-j-gray-500">Nenhum aviso recente.</p>}
            </SideCard>

            {canCreate && (
                <button
                    id="tour-feed-create-btn"
                    type="button"
                    onClick={() => {
                        setContent(<CreatePublicationModal publishEventImmediately />);
                        setOpen();
                    }}
                    className="hidden min-h-16 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-j-yellow-300 px-6 text-base font-extrabold text-j-blue-900 shadow-sm transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-j-yellow-400 hover:shadow-md active:translate-y-0 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-800 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 lg:flex"
                >
                    <Plus size={21} aria-hidden="true" />
                    Postar
                </button>
            )}
        </aside>
    );
}
