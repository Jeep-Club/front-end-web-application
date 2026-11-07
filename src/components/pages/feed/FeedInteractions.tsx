"use client";

import { setPublicationLikeAction } from "@/server/actions/publications/feed";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import { useMutation,useQueryClient } from "@tanstack/react-query";
import { Heart,MessageCircle } from "lucide-react";

export function FeedInteractions({ publication, onComments }: { publication: { id: number; likeCount: number; commentCount: number; likedByMe: boolean }; onComments?: () => void }) {
    const permissions = useUserStore((state) => state.permissions);
    const canLike = hasPermission(permissions, "PUBLICATIONS", "INTERACTION_LIKE");
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: () => setPublicationLikeAction({ id: publication.id, like: !publication.likedByMe }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["publications"] }),

    });
    return <div className="flex items-center gap-5 text-sm text-j-gray-600">
        {canLike ? <button type="button" disabled={mutation.isPending} aria-pressed={publication.likedByMe} aria-label={publication.likedByMe ? "Remover curtida" : "Curtir publicação"} onClick={() => mutation.mutate()} className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-1 transition-colors focus-visible:outline-2 focus-visible:outline-j-blue-800 disabled:opacity-50 ${publication.likedByMe ? "text-red-500" : "hover:text-red-500"}`}>
            <Heart size={19} fill={publication.likedByMe ? "currentColor" : "none"} aria-hidden="true" />{publication.likeCount}
        </button> : <span className="inline-flex items-center gap-2" aria-label={`${publication.likeCount} curtidas`}><Heart size={19} aria-hidden="true" />{publication.likeCount}</span>}
        {onComments ? <button type="button" onClick={onComments} aria-label={`${publication.commentCount} comentários. Abrir publicação`} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-1 hover:text-j-blue-800 focus-visible:outline-2 focus-visible:outline-j-blue-800"><MessageCircle size={19} aria-hidden="true" />{publication.commentCount}</button>
            : <span className="inline-flex items-center gap-2" aria-label={`${publication.commentCount} comentários`}><MessageCircle size={19} aria-hidden="true" />{publication.commentCount}</span>}
    </div>;
}
