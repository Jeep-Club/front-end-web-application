"use client";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircle, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { deletePublicationAction } from "@/actions/admin/publications/delete";
import { Button, ButtonIcon } from "@/components/common/button";
import { useModal } from "@/providers/ModalProvider";

export function PublicationDeleteConfirmationModal({ publication, onDeleted }: { publication: Publication; onDeleted: () => void }) {
    const { setClose } = useModal();
    const mutation = useMutation({
        mutationFn: () => deletePublicationAction(publication.id),
        onSuccess: () => { setClose(); toast.success("Publicação excluída com sucesso!"); onDeleted(); },
        onError: (error) => toast.error(error.message || "Não foi possível excluir a publicação."),
    });
    return (
        <div role="alertdialog" aria-modal="true" aria-labelledby="delete-publication-title" aria-describedby="delete-publication-description" className="relative flex max-h-[92dvh] w-full max-w-125 flex-col overflow-y-auto rounded-3xl bg-j-white shadow-2xl">
            <ButtonIcon onClick={setClose} disabled={mutation.isPending} aria-label="Fechar confirmação" className="absolute right-4 top-4 rounded-full bg-j-gray-100 p-2 text-j-gray-600"><X size={20} /></ButtonIcon>
            <header className="border-b border-j-gray-200 px-6 pb-5 pr-16 pt-7 md:px-8">
                <div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-j-red-100 text-j-red-500"><Trash2 size={20} /></span><div>
                    <h2 id="delete-publication-title" className="text-xl font-extrabold text-j-blue-800">Excluir publicação?</h2>
                    <p id="delete-publication-description" className="mt-1 text-sm leading-relaxed text-j-gray-500">Você está prestes a excluir <strong className="text-j-blue-800">{publication.title}</strong>. Esta operação não poderá ser desfeita.</p>
                </div></div>
            </header>
            <div className="flex gap-3 px-6 py-5 md:px-8">
                <Button onClick={setClose} disabled={mutation.isPending} className="flex-1 border-2 border-j-gray-200 bg-j-white text-j-gray-600 hover:bg-j-gray-100">Cancelar</Button>
                <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} autoFocus className="flex-1 bg-j-red-500 text-j-white hover:bg-j-red-600 hover:text-j-white">{mutation.isPending ? <><LoaderCircle size={16} className="animate-spin" /> Excluindo...</> : <><Trash2 size={16} /> Excluir publicação</>}</Button>
            </div>
        </div>
    );
}

