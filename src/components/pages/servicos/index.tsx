"use client";

import Image from "next/image";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ChevronRight, LoaderCircle, MessageCircle, Store } from "lucide-react";
import { useModal } from "@/providers/ModalProvider";
import { Button } from "@/components/common/button";
import { PublicationDetailModal } from "@/components/pages/feed/PublicationDetailModal";
import { listPublicationFeedAction } from "@/server/actions/publications/feed";
import type { PublicationFeedItem } from "@/schemas/publications/feed";
import { getMediaImageUrl } from "@/utils/media/imageUrl";
import { publicationPlainText } from "@/utils/publications/content";
import { mergeFeedPages, nextFeedPage } from "@/utils/publications/infiniteFeed";
import { publicationReadError, publicationReadRetry } from "@/components/pages/feed/feedDisplay";

type ServiceItem = Extract<PublicationFeedItem, { type: "SERVICE" }>;

function servicePrice(amount: number) {
    if (amount <= 0) return "A combinar";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);
}

function whatsappHref(phone: string) {
    const digits = phone.replace(/\D/g, "");
    const number = digits.startsWith("55") ? digits : `55${digits}`;
    return `https://wa.me/${number}`;
}

function ServiceCard({ service, onOpen }: { service: ServiceItem; onOpen: (id: number) => void }) {
    const image = getMediaImageUrl(service.primaryImage?.storageKey);
    const description = publicationPlainText(service.content).trim();

    return <article className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm transition-shadow hover:shadow-md">
        <button type="button" onClick={() => onOpen(service.id)} aria-label={`Ver detalhes do serviço: ${service.title}`} className="group relative block aspect-[16/9] w-full cursor-pointer overflow-hidden bg-j-blue-50 text-left focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-j-blue-700">
            {image ? <Image src={image} alt="" fill unoptimized sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" /> : <span className="flex h-full w-full items-center justify-center text-j-blue-700"><Store size={34} aria-hidden="true" /></span>}
            <span className="absolute left-3 top-3 rounded-full bg-j-blue-900 px-3 py-1 text-xs font-bold text-j-white">Serviço</span>
        </button>
        <div className="flex flex-1 flex-col p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <h2 className="min-w-0 break-words text-lg font-extrabold text-j-blue-900">{service.title}</h2>
                <span className="shrink-0 rounded-full bg-j-blue-50 px-3 py-1 text-sm font-extrabold text-j-blue-800">{servicePrice(service.details.amount)}</span>
            </div>
            {description && <p className="mt-2 line-clamp-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-j-gray-600">{description}</p>}
            <div className="mt-auto flex flex-wrap gap-2 pt-5">
                <Button type="button" onClick={() => onOpen(service.id)} className="min-h-10 flex-1">Ver detalhes <ChevronRight size={16} aria-hidden="true" /></Button>
                {service.details.contactPhone && <a href={whatsappHref(service.details.contactPhone)} target="_blank" rel="noreferrer" className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-j-gray-200 px-3 text-sm font-bold text-j-blue-800 transition-colors hover:border-j-blue-300 hover:bg-j-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-700"><MessageCircle size={16} aria-hidden="true" />Contato</a>}
            </div>
        </div>
    </article>;
}

export default function ServicesPage() {
    const { setContent, setOpen } = useModal();
    const query = useInfiniteQuery({
        queryKey: ["publications", "services-page", { type: "SERVICE", size: 12 }],
        queryFn: ({ pageParam }) => listPublicationFeedAction({ type: "SERVICE", page: pageParam, size: 12 }),
        initialPageParam: 0,
        getNextPageParam: nextFeedPage,
        retry: publicationReadRetry,
    });
    const services = mergeFeedPages(query.data?.pages ?? []).filter((item): item is ServiceItem => item.type === "SERVICE");
    const failure = publicationReadError(query.error);

    function openDetails(id: number) {
        setContent(<PublicationDetailModal publicationId={id} />);
        setOpen();
    }

    return <main className="min-h-full w-full px-3 py-4 pb-8 md:px-6 md:py-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
            <header className="rounded-2xl border border-j-gray-200 bg-j-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-j-blue-50 text-j-blue-800"><Store size={23} aria-hidden="true" /></span>
                    <div className="min-w-0">
                        <h1 className="text-2xl font-extrabold text-j-blue-900 md:text-3xl">Serviços</h1>
                        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-j-gray-600">Encontre serviços oferecidos pela comunidade do Jeep Clube Tamoios e entre em contato com quem publicou.</p>
                    </div>
                </div>
            </header>

            {query.isPending ? <div role="status" className="flex min-h-56 items-center justify-center gap-3 rounded-2xl border border-j-gray-200 bg-j-white text-sm text-j-gray-500"><LoaderCircle size={20} className="animate-spin" aria-hidden="true" />Carregando serviços...</div>
                : query.isError ? <div role="alert" className="rounded-2xl border border-j-gray-200 bg-j-white p-6 text-center"><p className="text-sm text-j-gray-600">{failure.message}</p><Button className="mt-3" onClick={() => void query.refetch()}>Tentar novamente</Button></div>
                    : services.length === 0 ? <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-j-gray-300 bg-j-white p-6 text-center"><span className="flex size-12 items-center justify-center rounded-2xl bg-j-blue-50 text-j-blue-800"><Store size={22} aria-hidden="true" /></span><h2 className="mt-4 font-extrabold text-j-blue-900">Nenhum serviço publicado</h2><p className="mt-1 max-w-md text-sm text-j-gray-500">Quando houver serviços disponíveis, eles aparecerão aqui.</p></div>
                        : <>
                            <section aria-label="Serviços publicados" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {services.map((service) => <ServiceCard key={service.id} service={service} onOpen={openDetails} />)}
                            </section>
                            {query.isFetchNextPageError && <div role="alert" className="text-center text-sm text-red-600">{failure.message}</div>}
                            {query.hasNextPage && <div className="flex justify-center"><Button type="button" disabled={query.isFetchingNextPage} onClick={() => void query.fetchNextPage()} className="min-w-48">{query.isFetchingNextPage ? <><LoaderCircle size={17} className="animate-spin" aria-hidden="true" />Carregando...</> : "Carregar mais serviços"}</Button></div>}
                        </>}
        </div>
    </main>;
}
