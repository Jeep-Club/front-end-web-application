"use client";

import { useQuery } from "@tanstack/react-query";
import { Share2, X } from "lucide-react";
import { Button, ButtonIcon } from "@/components/common/button";
import { RichTextContent } from "@/components/common/rich-text/RichTextContent";
import { getPublicationFeedDetailAction } from "@/actions/publications/feed";
import { useModal } from "@/providers/ModalProvider";
import { useUserStore } from "@/stores/userStore";
import { PublicationPhotoCarousel } from "./PublicationPhotoCarousel";
import { FeedInteractions } from "./FeedInteractions";
import { FeedMetadata } from "./FeedMetadata";
import { PublicationComments } from "./PublicationComments";
import { feedTypes } from "./feedDisplay";
import { RelativeTime } from "./RelativeTime";
import { EventParticipants } from "./EventParticipants";
import { EventParticipation } from "./EventParticipation";

export function PublicationDetailModal({ publicationId, onClose }: { publicationId: number; onClose?: () => void }) {
    const { setClose } = useModal();
    const permissions = useUserStore((state) => state.permissions);
    const query = useQuery({ queryKey: ["publications", "detail", publicationId, permissions], queryFn: () => getPublicationFeedDetailAction(publicationId) });
    const publication = query.data;
    return <div role="dialog" aria-modal="true" aria-labelledby="feed-detail-title" className="relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-y-auto rounded-3xl bg-j-white shadow-2xl">
        <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
            {publication?.type === "EVENT" && <a
                href={typeof window === "undefined" ? "https://wa.me/" : `https://wa.me/?text=${encodeURIComponent(`Vamos nesse evento do Jeep Clube Tamoios? ${publication.title}\n${new URL("/feed?publication=" + publication.id, window.location.origin).toString()}`)}`}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`Compartilhar evento ${publication.title} no WhatsApp`}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-[#25D366]/10 px-3 text-sm font-bold text-[#168A43] hover:bg-[#25D366]/20 focus-visible:outline-2 focus-visible:outline-j-blue-800"
            ><Share2 size={16} aria-hidden="true" /><span className="hidden sm:inline">Compartilhar</span></a>}
            <ButtonIcon aria-label="Fechar publicação" onClick={onClose ?? setClose} className="rounded-full bg-j-gray-100 p-2 text-j-gray-600 hover:bg-j-gray-200"><X size={20} /></ButtonIcon>
        </div>
        <header className="border-b border-j-gray-200 px-5 pb-5 pr-16 pt-6 md:px-8"><h2 id="feed-detail-title" className="break-words text-xl font-extrabold text-j-blue-800">{publication?.title ?? "Publicação"}</h2>
            {publication && <p className="mt-2 text-xs text-j-gray-500">{feedTypes[publication.type].label} · <RelativeTime value={publication.publishedAt} /></p>}
        </header>
        {query.isLoading && <p role="status" className="p-6 text-sm text-j-gray-500">Carregando publicação...</p>}
        {query.isError && <div role="alert" className="p-6"><p className="text-sm text-red-500">{query.error.message}</p><Button className="mt-4" onClick={() => void query.refetch()}>Tentar novamente</Button></div>}
        {publication && <>
            <div className="flex flex-col gap-5 p-5 md:p-8">
                <PublicationPhotoCarousel key={publication.id} images={publication.images} title={publication.title} />
                <FeedMetadata publication={publication} />
                {publication.type === "EVENT" && <EventParticipants details={publication.details} />}
                {publication.type === "EVENT" && <EventParticipation eventId={publication.id} eventStatus={publication.details.status} charges={publication.details.charges} />}
                <RichTextContent content={publication.content} />
                <FeedInteractions publication={publication} />
            </div>
            <PublicationComments publicationId={publication.id} />
        </>}
    </div>;
}
