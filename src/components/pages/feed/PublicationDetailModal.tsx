"use client";

import { Button, ButtonIcon } from "@/components/common/button";
import { RichTextContent } from "@/components/common/rich-text/RichTextContent";
import { useModal } from "@/providers/ModalProvider";
import { getPublicationFeedDetailAction } from "@/server/actions/publications/feed";
import { useUserStore } from "@/stores/userStore";
import { useQuery } from "@tanstack/react-query";
import { X, Share2 } from "lucide-react";
import { isValidElement, useEffect, useRef } from "react";
import { hasPermission } from "@/utils/permission/hasPermission";
import { feedTypes, publicationReadError, publicationReadRetry } from "./feedDisplay";
import { PublicationPhotoCarousel } from "./PublicationPhotoCarousel";
import { FeedInteractions } from "./FeedInteractions";
import { FeedMetadata } from "./FeedMetadata";
import { PublicationComments } from "./PublicationComments";
import { RelativeTime } from "./RelativeTime";
import { EventParticipants } from "./EventParticipants";
import { EventParticipation } from "./EventParticipation";


export function PublicationDetailModal({ publicationId, onClose }: { publicationId: number; onClose?: () => void }) {
    const { setClose, content: overlayContent } = useModal();
    const permissions = useUserStore((state) => state.permissions);
    const canRead = hasPermission(permissions, 'PUBLICATIONS', 'PUBLICATION_READ');
    const dialogRef = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        const dialog = dialogRef.current;
        const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        return () => {
            dialog?.close();
            const target = previous?.isConnected && previous !== document.body ? previous : document.querySelector<HTMLElement>('[data-publication-return]');
            target?.focus({ preventScroll: true });
        };
    }, []);
    useEffect(() => {
        const dialog = dialogRef.current;
        // Participation opens an existing provider modal. Yield the top layer to it,
        // then restore this detail when that flow closes; agenda may itself own us.
        const ownsDetail = isValidElement(overlayContent) && overlayContent.type === PublicationDetailModal;
        const preventReopenedDialogCancel = (event: KeyboardEvent) => {
            // Closing the provider overlay reopens this dialog during keydown.
            // Do not let the same Escape's native default cancel the reopened detail.
            if (event.key === 'Escape') event.preventDefault();
        };
        if (overlayContent && !ownsDetail) {
            dialog?.close();
            document.addEventListener('keydown', preventReopenedDialogCancel, true);
        }
        else if (dialog && !dialog.open) dialog.showModal();
        return () => document.removeEventListener('keydown', preventReopenedDialogCancel, true);
    }, [overlayContent]);
    const query = useQuery({ enabled: canRead && Number.isSafeInteger(publicationId) && publicationId > 0, staleTime: 0, retry: publicationReadRetry, queryKey: ["publications", "detail", publicationId, permissions], queryFn: () => getPublicationFeedDetailAction(publicationId) });
    const failure = publicationReadError(query.error);
    const publication = canRead && !failure.restricted ? query.data : undefined;
    return <dialog ref={dialogRef} onKeyDown={event => {
        if (event.key !== 'Tab') return;
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(element => element.getClientRects().length > 0);
        const first = controls[0];
        const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }} onCancel={event => { event.preventDefault(); (onClose ?? setClose)(); }} aria-modal="true" aria-labelledby="feed-detail-title" className="m-auto border-0 p-0 text-j-gray-700 backdrop:bg-black/60 relative hidden open:flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-y-auto rounded-3xl bg-j-white shadow-2xl">
        <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
            {publication?.type === "EVENT" && <a
                href={typeof window === "undefined" ? "https://wa.me/" : `https://wa.me/?text=${encodeURIComponent(`Vamos nesse evento do Jeep Clube Tamoios? ${publication.title}\n${new URL("/feed?publication=" + publication.id, window.location.origin).toString()}`)}`}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`Compartilhar evento ${publication.title} no WhatsApp`}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-[#25D366]/10 px-3 text-sm font-bold text-j-blue-800 hover:bg-[#25D366]/20 focus-visible:outline-2 focus-visible:outline-j-blue-800"
            ><Share2 size={16} aria-hidden="true" /><span className="hidden sm:inline">Compartilhar</span></a>}
            <ButtonIcon aria-label="Fechar publicação" onClick={onClose ?? setClose} className="rounded-full bg-j-gray-100 p-2 text-j-gray-600 hover:bg-j-gray-200"><X size={20} /></ButtonIcon>
        </div>
        <header className={`border-b border-j-gray-200 py-6 pl-5 md:pl-8 ${publication?.type === 'EVENT' ? 'pr-28 md:pr-56' : 'pr-16'}`}><h2 id="feed-detail-title" className="break-words text-xl font-extrabold text-j-blue-800">{publication?.title ?? "Publicação"}</h2>
            {publication && <p className="mt-2 text-xs text-j-gray-500">{feedTypes[publication.type].label} · <RelativeTime value={publication.publishedAt} /></p>}
            {publication && <Button className="mt-3" disabled={query.isFetching} aria-busy={query.isFetching} onClick={() => void query.refetch()}>Atualizar publicação</Button>}
        </header>
        {!canRead && <p role="alert" className="p-6">Seu usuário não possui permissão para consultar esta publicação.</p>}
        {query.isLoading && <p role="status" className="p-6 text-sm text-j-gray-500">Carregando publicação...</p>}
        {query.isError && <div role="alert" className="p-6"><p className="text-sm text-input-error-text">{failure.message}</p><Button className="mt-4" onClick={() => void query.refetch()}>Tentar novamente</Button></div>}
        {publication && <>
            <div className="flex flex-col gap-5 p-5 md:p-8">
                <PublicationPhotoCarousel key={publication.id} images={publication.images} title={publication.title} />
                <FeedMetadata publication={publication} />
                {publication.type === "EVENT" && <EventParticipants details={publication.details} />}
                {publication.type === "EVENT" && <EventParticipation eventId={publication.id} eventStatus={publication.details.status} />}
                <p className="text-sm text-j-gray-600">Autor — identificação #{publication.authorUserId}</p>
                <RichTextContent content={publication.content} />
                <FeedInteractions publication={publication} />
            </div>
            <PublicationComments publicationId={publication.id} />
        </>}
    </dialog>;
}
