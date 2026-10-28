"use client";

import { Button } from "@/components/common/button";
import { createPublicationCommentAction,listPublicationCommentsAction } from "@/server/actions/publications/feed";
import { useUserStore } from "@/stores/userStore";
import { getMediaImageUrl } from "@/utils/media/imageUrl";
import { hasPermission } from "@/utils/permission/hasPermission";
import { useMutation,useQuery,useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import Image from "next/image";
import { useId,useState } from "react";
import toast from "react-hot-toast";
import { RelativeTime } from "./RelativeTime";

export function PublicationComments({ publicationId }: { publicationId: number }) {
    const permissions = useUserStore((state) => state.permissions);
    const canRead = hasPermission(permissions, "PUBLICATIONS", "COMMENT_READ");
    const canCreate = hasPermission(permissions, "PUBLICATIONS", "COMMENT_CREATE");
    const [page, setPage] = useState(0);
    const [text, setText] = useState("");
    const id = useId();
    const client = useQueryClient();
    const comments = useQuery({ queryKey: ["publications", "comments", publicationId, page, permissions], queryFn: () => listPublicationCommentsAction({ id: publicationId, page }), enabled: canRead });
    const mutation = useMutation({
        mutationFn: () => createPublicationCommentAction({ id: publicationId, text }),
        onSuccess: async () => { setText(""); setPage(0); await client.invalidateQueries({ queryKey: ["publications"] }); toast.success("Comentário enviado!"); },

    });
    if (!canRead && !canCreate) return null;
    return <section aria-label="Comentários" className="border-t border-j-gray-200 p-5 md:p-8">
        <h3 className="font-bold text-j-blue-800">Comentários</h3>
        {canCreate && <form onSubmit={(event) => { event.preventDefault(); if (text.trim() && !mutation.isPending) mutation.mutate(); }} className="mt-4 flex flex-col gap-3">
            <label htmlFor={id} className="text-sm font-semibold text-j-gray-700">Seu comentário</label>
            <textarea id={id} value={text} disabled={mutation.isPending} onChange={(event) => setText(event.target.value)} rows={3} required placeholder="Escreva um comentário..." className="w-full resize-y rounded-xl border border-j-gray-200 bg-j-white p-3 text-sm text-j-gray-700 placeholder:text-j-gray-400 focus:outline-2 focus:outline-j-blue-700" />
            <Button type="submit" disabled={!text.trim() || mutation.isPending} className="self-end"><Send size={15} />{mutation.isPending ? "Enviando..." : "Comentar"}</Button>
        </form>}
        {canRead && <div className="mt-5 flex flex-col gap-4" aria-live="polite">
            {comments.isLoading ? <p className="text-sm text-j-gray-500">Carregando comentários...</p>
                : comments.isError ? <div role="alert"><p className="text-sm text-red-500">{comments.error.message}</p><Button onClick={() => void comments.refetch()} className="mt-2">Tentar novamente</Button></div>
                : !comments.data?.content.length ? <p className="text-sm text-j-gray-500">Ainda não há comentários.</p>
                : comments.data.content.map((comment) => <article key={comment.id} className="rounded-xl border border-j-gray-200 bg-j-gray-100/50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        {comment.authorName && <span className="text-sm font-bold text-j-blue-800">{comment.authorName}</span>}
                        <RelativeTime value={comment.createdAt} className="text-xs text-j-gray-500" />
                    </div>
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm text-j-gray-700">{comment.text}</p>
                    {comment.images.length > 0 && <div className="mt-3 grid grid-cols-2 gap-2">{comment.images.map((image) => <div key={image.storageKey} className="relative aspect-video overflow-hidden rounded-lg"><Image src={getMediaImageUrl(image.storageKey)} alt="Imagem do comentário" fill unoptimized sizes="40vw" className="object-cover" /></div>)}</div>}
                </article>)}
            {comments.data && comments.data.totalPages > 1 && <div className="flex items-center justify-center gap-3">
                <Button disabled={comments.isFetching || comments.data.first} onClick={() => setPage((value) => Math.max(0, value - 1))}>Anterior</Button>
                <span className="text-xs text-j-gray-600">{page + 1} / {comments.data.totalPages}</span>
                <Button disabled={comments.isFetching || comments.data.last} onClick={() => setPage((value) => value + 1)}>Próxima</Button>
            </div>}
        </div>}
    </section>;
}
