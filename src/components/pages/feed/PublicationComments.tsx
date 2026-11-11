"use client";

import { useId, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, ImagePlus, Send, X } from "lucide-react";
import { Button } from "@/components/common/button";
import { createPublicationCommentAction, listPublicationCommentsAction } from "@/server/actions/publications/feed";
import { uploadImageAction } from "@/server/actions/media/upload-image";
import { useUserStore } from "@/stores/userStore";
import { getMediaImageUrl } from "@/utils/media/imageUrl";
import { hasPermission } from "@/utils/permission/hasPermission";
import { PublicationCommentAuthor } from "./PublicationCommentAuthor";

import Image from "next/image";
import toast from "react-hot-toast";

const MAX_COMMENT_IMAGES = 10;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const COMMENT_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function PublicationComments({ publicationId }: { publicationId: number }) {
    const permissions = useUserStore((state) => state.permissions);
    const canRead = hasPermission(permissions, "PUBLICATIONS", "COMMENT_READ");
    const canCreate = hasPermission(permissions, "PUBLICATIONS", "COMMENT_CREATE");
    const [page, setPage] = useState(0);
    const [text, setText] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [expanded, setExpanded] = useState(true);
    const id = useId();
    const fileInput = useRef<HTMLInputElement>(null);
    const uploadedImages = useRef(new Map<File, string>());
    const client = useQueryClient();
    const comments = useQuery({ queryKey: ["publications", "comments", publicationId, page, permissions], queryFn: () => listPublicationCommentsAction({ id: publicationId, page }), enabled: canRead });
    const mutation = useMutation({
        mutationFn: async () => {
            const images: { storageKey: string; position: number }[] = [];
            for (const file of files) {
                let storageKey = uploadedImages.current.get(file);
                if (!storageKey) {
                    const formData = new FormData();
                    formData.set("file", file);
                    storageKey = await uploadImageAction(formData);
                    uploadedImages.current.set(file, storageKey);
                }
                images.push({ storageKey, position: images.length });
            }
            return createPublicationCommentAction({ id: publicationId, text, images });
        },
        onSuccess: async () => { setText(""); setFiles([]); uploadedImages.current.clear(); setPage(0); await client.invalidateQueries({ queryKey: ["publications"] }); toast.success("Comentário enviado!"); },
        onError: (error) => toast.error(error instanceof Error ? error.message : "Não foi possível enviar o comentário."),

    });
    const addFiles = (selected: FileList | null) => {
        if (!selected) return;
        const validFiles: File[] = [];
        for (const file of Array.from(selected)) {
            if (!COMMENT_IMAGE_TYPES.includes(file.type)) {
                toast.error(`${file.name}: envie uma imagem JPEG, PNG ou WebP.`);
            } else if (file.size > MAX_IMAGE_SIZE) {
                toast.error(`${file.name}: a imagem deve ter no máximo 5 MiB.`);
            } else {
                validFiles.push(file);
            }
        }
        const availableSlots = MAX_COMMENT_IMAGES - files.length;
        if (validFiles.length > availableSlots) toast.error(`Cada comentário pode ter no máximo ${MAX_COMMENT_IMAGES} imagens.`);
        setFiles(current => [...current, ...validFiles.slice(0, Math.max(0, availableSlots))]);
        if (fileInput.current) fileInput.current.value = "";
    };
    if (!canRead && !canCreate) return null;
    return <section aria-label="Comentários" className="border-t border-j-gray-200 p-5 md:p-8">
        <div className="flex items-center justify-between gap-3">
            <h3 className="font-bold text-j-blue-800">Comentários</h3>
            <button type="button" aria-expanded={expanded} onClick={() => setExpanded(value => !value)} className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg px-2 text-sm font-bold text-j-blue-700 hover:bg-j-gray-100 focus-visible:outline-2 focus-visible:outline-j-blue-800">
                {expanded ? <><ChevronUp size={16} aria-hidden="true" />Ocultar</> : <><ChevronDown size={16} aria-hidden="true" />Mostrar</>}
            </button>
        </div>
        {expanded && <>
        {canCreate && <form onSubmit={(event) => { event.preventDefault(); if ((text.trim() || files.length) && !mutation.isPending) mutation.mutate(); }} className="mt-4 flex flex-col gap-3">
            <label htmlFor={id} className="text-sm font-semibold text-j-gray-700">Seu comentário</label>
            <textarea id={id} value={text} maxLength={10_000} disabled={mutation.isPending} onChange={(event) => setText(event.target.value)} rows={3} placeholder="Escreva um comentário..." className="w-full resize-y rounded-xl border border-j-gray-200 bg-j-white p-3 text-sm text-j-gray-700 placeholder:text-j-gray-400 focus:outline-2 focus:outline-j-blue-700" />
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={mutation.isPending || files.length >= MAX_COMMENT_IMAGES} onChange={(event) => addFiles(event.target.files)} className="sr-only" tabIndex={-1} aria-hidden="true" />
                    <Button type="button" disabled={mutation.isPending || files.length >= MAX_COMMENT_IMAGES} onClick={() => fileInput.current?.click()}><ImagePlus size={16} />Adicionar imagens ({files.length}/{MAX_COMMENT_IMAGES})</Button>
                    <p className="mt-1 text-xs text-j-gray-500">JPEG, PNG ou WebP, até 5 MiB cada.</p>
                </div>
                <Button type="submit" isLoading={mutation.isPending} disabled={!text.trim() && files.length === 0} className="ml-auto"><Send size={15} />{mutation.isPending ? "Enviando..." : "Comentar"}</Button>
            </div>
            {files.length > 0 && <ul aria-label="Imagens selecionadas" className="flex flex-col gap-2">
                {files.map((file, index) => <li key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center justify-between gap-2 rounded-lg bg-j-gray-100 px-3 py-2 text-sm text-j-gray-700">
                    <span className="min-w-0 truncate">{file.name} <span className="text-xs text-j-gray-500">({(file.size / (1024 * 1024)).toFixed(1)} MiB)</span></span>
                    <button type="button" aria-label={`Remover ${file.name}`} disabled={mutation.isPending} onClick={() => { uploadedImages.current.delete(file); setFiles(current => current.filter((_, fileIndex) => fileIndex !== index)); }} className="cursor-pointer rounded p-1 text-j-gray-600 hover:bg-j-gray-200 focus-visible:outline-2 focus-visible:outline-j-blue-700 disabled:cursor-not-allowed disabled:opacity-50"><X size={16} /></button>
                </li>)}
            </ul>}
        </form>}
        {canRead && <div className="mt-5 flex flex-col gap-4" aria-live="polite">
            {comments.isLoading ? <p className="text-sm text-j-gray-500">Carregando comentários...</p>
                : comments.isError ? <div role="alert"><p className="text-sm text-red-500">{comments.error.message}</p><Button onClick={() => void comments.refetch()} className="mt-2">Tentar novamente</Button></div>
                : !comments.data?.content.length ? <p className="text-sm text-j-gray-500">Ainda não há comentários.</p>
                : comments.data.content.map((comment) => <article key={comment.id} className="rounded-xl border border-j-gray-200 bg-j-gray-100/50 p-4">
                    <PublicationCommentAuthor
                        authorUserId={comment.authorUserId}
                        name={comment.authorName}
                        photo={comment.authorPhotoStorageKey ?? comment.authorProfilePhotoStorageKey ?? comment.authorPhotoUrl ?? comment.authorProfilePhotoUrl}
                        createdAt={comment.createdAt}
                    />
                    {comment.text && <p className="mt-2 whitespace-pre-wrap break-words text-sm text-j-gray-700">{comment.text}</p>}
                    {comment.images.length > 0 && <div className="mt-3 grid grid-cols-2 gap-2">{comment.images.map((image) => <div key={image.storageKey} className="relative aspect-video overflow-hidden rounded-lg"><Image src={getMediaImageUrl(image.storageKey)} alt="Imagem do comentário" fill unoptimized sizes="40vw" className="object-cover" /></div>)}</div>}
                </article>)}
            {comments.data && comments.data.totalPages > 1 && <div className="flex items-center justify-center gap-3">
                <Button disabled={comments.isFetching || comments.data.first} onClick={() => setPage((value) => Math.max(0, value - 1))}>Anterior</Button>
                <span className="text-xs text-j-gray-600">{page + 1} / {comments.data.totalPages}</span>
                <Button disabled={comments.isFetching || comments.data.last} onClick={() => setPage((value) => value + 1)}>Próxima</Button>
            </div>}
        </div>}
        </>}
    </section>;
}
