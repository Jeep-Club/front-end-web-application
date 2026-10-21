"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Button, ButtonIcon } from "@/components/common/button";
import { RichTextContent } from "@/components/common/rich-text/RichTextContent";
import { getPublicationFeedDetailAction } from "@/actions/publications/feed";
import { useModal } from "@/providers/ModalProvider";
import { useUserStore } from "@/stores/userStore";
import { getMediaImageUrl } from "@/utils/media/imageUrl";
import { FeedInteractions } from "./FeedInteractions";
import { FeedMetadata } from "./FeedMetadata";
import { PublicationComments } from "./PublicationComments";
import { feedDate, feedTypes } from "./feedDisplay";

export function PublicationDetailModal({ publicationId }: { publicationId: number }) {
    const { setClose } = useModal();
    const permissions = useUserStore((state) => state.permissions);
    const query = useQuery({ queryKey: ["publications", "detail", publicationId, permissions], queryFn: () => getPublicationFeedDetailAction(publicationId) });
    const publication = query.data;
    return <div role="dialog" aria-modal="true" aria-labelledby="feed-detail-title" className="relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-y-auto rounded-3xl bg-j-white shadow-2xl">
        <ButtonIcon aria-label="Fechar publicação" onClick={setClose} className="absolute right-4 top-4 z-10 rounded-full bg-j-gray-100 p-2 text-j-gray-600 hover:bg-j-gray-200"><X size={20} /></ButtonIcon>
        <header className="border-b border-j-gray-200 px-5 pb-5 pr-16 pt-6 md:px-8"><h2 id="feed-detail-title" className="break-words text-xl font-extrabold text-j-blue-800">{publication?.title ?? "Publicação"}</h2>
            {publication && <p className="mt-2 text-xs text-j-gray-500">{feedTypes[publication.type].label} · {feedDate(publication.publishedAt)}</p>}
        </header>
        {query.isLoading && <p role="status" className="p-6 text-sm text-j-gray-500">Carregando publicação...</p>}
        {query.isError && <div role="alert" className="p-6"><p className="text-sm text-red-500">{query.error.message}</p><Button className="mt-4" onClick={() => void query.refetch()}>Tentar novamente</Button></div>}
        {publication && <>
            <div className="flex flex-col gap-5 p-5 md:p-8">
                {publication.images.length > 0 && <div className="flex flex-col gap-3">{[...publication.images].sort((a,b) => a.position - b.position).map((image) => <div key={image.storageKey} className="relative aspect-video overflow-hidden rounded-xl bg-j-gray-100"><Image src={getMediaImageUrl(image.storageKey)} alt={publication.title} fill unoptimized sizes="(min-width: 768px) 720px, 90vw" className="object-contain" /></div>)}</div>}
                <FeedMetadata publication={publication} />
                <RichTextContent content={publication.content} />
                <FeedInteractions publication={publication} />
            </div>
            <PublicationComments publicationId={publication.id} />
        </>}
    </div>;
}