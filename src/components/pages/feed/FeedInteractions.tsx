"use client";

import { getPublicationFeedDetailAction, setPublicationLikeAction } from "@/server/actions/publications/feed";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import { useMutation,useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart,MessageCircle } from "lucide-react";

export function FeedInteractions({ publication, onComments }: { publication: { id: number; likeCount: number; commentCount: number; likedByMe: boolean }; onComments?: () => void }) {
    const permissions = useUserStore((state) => state.permissions);
    const canLike = hasPermission(permissions, "PUBLICATIONS", "INTERACTION_LIKE");
    const queryClient = useQueryClient();
    const router = useRouter();
    const canOpenComments = hasPermission(permissions, "PUBLICATIONS", "COMMENT_READ") || hasPermission(permissions, "PUBLICATIONS", "COMMENT_CREATE");
    const [reconciled, setReconciled] = useState<{ source: typeof publication; value: typeof publication } | null>(null);
    const current = reconciled?.source === publication ? reconciled.value : publication;
    const reconciliation = useMutation({
        // LikeResponse identifies the member's like, never the publication's total.
        mutationFn: () => getPublicationFeedDetailAction(publication.id),
        onSuccess: async (result) => {
            setReconciled({ source: publication, value: result });
            await queryClient.invalidateQueries({ queryKey: ["publications"] });
            router.refresh();
        },
    });
    const mutation = useMutation({
        mutationFn: (like: boolean) => setPublicationLikeAction({ id: publication.id, like }),
        onSuccess: (_, like) => {
            // A confirmed write remains applied even if the following read fails.
            setReconciled({ source: publication, value: { ...current, likedByMe: like } });
            reconciliation.mutate();
        },
    });
    const pending = mutation.isPending || reconciliation.isPending;
    return <div className="flex items-center gap-5 text-sm text-j-gray-600">
        {canLike ? <button type="button" disabled={pending} aria-pressed={current.likedByMe} aria-label={current.likedByMe ? "Remover curtida" : "Curtir publicação"} onClick={() => mutation.mutate(!current.likedByMe)} className={`cursor-pointer inline-flex min-h-10 items-center gap-2 rounded-lg px-1 transition-colors focus-visible:outline-2 focus-visible:outline-j-blue-800 disabled:opacity-50 ${current.likedByMe ? "text-red-500" : "hover:text-red-500"}`}>
            <Heart size={19} fill={current.likedByMe ? "currentColor" : "none"} aria-hidden="true" />{current.likeCount}
        </button> : <span className="inline-flex items-center gap-2" aria-label={`${current.likeCount} curtidas`}><Heart size={19} aria-hidden="true" />{current.likeCount}</span>}
        {onComments && canOpenComments ? <button type="button" onClick={onComments} aria-label={`${current.commentCount} comentários. Abrir publicação`} className="cursor-pointer inline-flex min-h-10 items-center gap-2 rounded-lg px-1 hover:text-j-blue-800 focus-visible:outline-2 focus-visible:outline-j-blue-800"><MessageCircle size={19} aria-hidden="true" />{current.commentCount}</button>
            : <span className="inline-flex items-center gap-2" aria-label={`${current.commentCount} comentários`}><MessageCircle size={19} aria-hidden="true" />{current.commentCount}</span>}
        {mutation.isError && <p role="alert" className="text-input-error-text">Não foi possível atualizar sua curtida. Tente novamente.</p>}
        {reconciliation.isError && <div role="alert" className="text-input-error-text">Curtida atualizada. Não foi possível atualizar os contadores. <button type="button" disabled={pending} onClick={() => reconciliation.mutate()} className="cursor-pointer rounded underline focus-visible:outline-2 focus-visible:outline-j-blue-800">Atualizar contadores</button></div>}
    </div>;
}
