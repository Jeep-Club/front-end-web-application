"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import { Archive, Flag, Pencil, Send, Trash2, X, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { Button, ButtonIcon } from "@/components/common/button";
import { ConfirmButton } from "@/components/common/button/ConfirmButton";
import { Form } from "@/components/common/form";
import { InputRegister } from "@/components/common/input/input-register";
import { RichTextRegister } from "@/components/common/rich-text/RichTextRegister";
import { useModal } from "@/providers/ModalProvider";
import { draftEditorialSchema, draftMutationSchema, type DraftEditorialData } from "@/schemas/publications/draft";
import { mutateDraftPublicationAction } from "@/actions/publications/draft";
import styles from "./CreatePublicationModal.module.css";
import { publishedMutationSchema } from "@/schemas/publications/published";
import { mutatePublishedPublicationAction } from "@/actions/publications/published";

export interface DraftPublicationTarget { id: number; type: "NOTICE" | "EVENT" | "SERVICE"; status?: "DRAFT" | "PUBLISHED"; title: string; content: string }
const actionDetails = {
    archive: { title: "Arquivar publicação?", label: "Arquivar", progress: "Arquivando...", success: "Publicação arquivada!", icon: Archive },
    cancel: { title: "Cancelar evento?", label: "Cancelar evento", progress: "Cancelando...", success: "Evento cancelado!", icon: XCircle },
    finish: { title: "Encerrar evento?", label: "Encerrar evento", progress: "Encerrando...", success: "Evento encerrado!", icon: Flag },
    edit: { title: "Editar publicação", label: "Salvar alterações", progress: "Salvando...", success: "Publicação atualizada!", icon: Pencil },
    publish: { title: "Publicar rascunho?", label: "Publicar", progress: "Publicando...", success: "Publicação publicada com sucesso!", icon: Send },
    delete: { title: "Excluir publicação?", label: "Excluir", progress: "Excluindo...", success: "Publicação excluída!", icon: Trash2 },
};

function EditFields({ onClose }: { onClose: () => void }) {
    const { formState: { isSubmitting } } = useFormContext<DraftEditorialData>();
    return <>
        <fieldset disabled={isSubmitting} className={`${styles.fields} flex w-full min-w-0 flex-col gap-5`}>
            <InputRegister name="title" label="Título" maxLength={200} required />
            <RichTextRegister name="content" label="Conteúdo" required />
        </fieldset>
        <div className="flex w-full flex-col-reverse gap-3 border-t border-j-gray-200 pt-5 sm:flex-row">
            <Button onClick={onClose} disabled={isSubmitting} className="flex-1 border-2 border-j-gray-200 bg-j-white text-j-gray-600 hover:bg-j-gray-100 hover:text-j-gray-700">Cancelar</Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-j-blue-700 text-j-white hover:bg-j-blue-800 hover:text-j-white">{isSubmitting ? "Salvando..." : "Salvar alterações"}</Button>
        </div>
    </>;
}

export function DraftPublicationActionModal({ publication, action }: { publication: DraftPublicationTarget; action: "edit" | "publish" | "delete" | "archive" | "cancel" | "finish" }) {
    const { setClose } = useModal();
    const queryClient = useQueryClient();
    const details = actionDetails[action];
    const Icon = details.icon;
    const mutation = useMutation({
        mutationFn: async (values: DraftEditorialData | undefined) => {
            const input = { id: publication.id, type: publication.type, action, ...values };
            if (publication.status === "PUBLISHED") await mutatePublishedPublicationAction(publishedMutationSchema.parse(input));
            else await mutateDraftPublicationAction(draftMutationSchema.parse(input));
        },
        onSuccess: () => {
            if (action !== "edit") {
                const url = new URL(window.location.href);
                url.searchParams.delete("page");
                window.history.replaceState(null, "", `${url.pathname}${url.search}`);
            }
            void queryClient.invalidateQueries({ queryKey: ["publications"] });
            toast.success(details.success);
            setClose();
        },
        onError: (error) => toast.error(error.message || "Não foi possível concluir a ação."),
    });
    const confirm = () => {
        if (action !== "edit") mutation.mutate(undefined);
    };
    return <div role="dialog" aria-modal="true" aria-labelledby="draft-action-title" className={`relative flex max-h-[92dvh] w-full flex-col overflow-y-auto overflow-x-hidden rounded-3xl bg-j-white shadow-2xl ${action === "edit" ? "max-w-3xl" : "max-w-xl"}`}>
        <ButtonIcon aria-label="Fechar" disabled={mutation.isPending} onClick={setClose} className="absolute right-4 top-4 z-10 rounded-full bg-j-gray-100 p-2 text-j-gray-600 hover:bg-j-gray-200 hover:text-j-blue-800 md:right-6 md:top-6"><X size={20} /></ButtonIcon>
        <header className="border-b border-j-gray-200 px-5 pb-5 pr-16 pt-6 md:px-8 md:pb-6 md:pr-20 md:pt-8">
            <div className="flex items-start gap-4">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${(action === "delete" || action === "cancel") ? "bg-red-50 text-red-500" : "bg-j-blue-800 text-j-yellow-300"}`}><Icon size={20} /></span>
                <div><h2 id="draft-action-title" className="text-xl font-extrabold text-j-blue-800 md:text-2xl">{details.title}</h2>
                    <p className="mt-2 break-words text-sm text-j-gray-600">{publication.title}</p>
                    {action === "archive" && <p className="mt-2 text-sm text-j-gray-500">A publicação deixará de aparecer no feed e ficará disponível no filtro Arquivados.</p>}
                    {action === "cancel" && <p className="mt-2 text-sm text-j-gray-500">O evento e seus ciclos financeiros próprios serão cancelados.</p>}
                    {action === "finish" && <p className="mt-2 text-sm text-j-gray-500">A operação do evento será encerrada. A publicação continuará disponível no feed.</p>}
                    {action === "publish" && <p className="mt-2 text-sm text-j-gray-500">O conteúdo ficará disponível no feed dos associados.</p>}
                    {action === "delete" && <p className="mt-2 text-sm text-j-gray-500">A publicação será removida da gestão. Esta ação não pode ser desfeita pela tela.</p>}
                </div>
            </div>
        </header>
        {action === "edit" ? <Form<DraftEditorialData> schema={draftEditorialSchema} formOptions={{ defaultValues: { title: publication.title, content: publication.content } }}
            onSubmit={async (values) => { try { await mutation.mutateAsync(values); } catch { /* O onError apresenta a mensagem. */ } }}
            onError={() => toast.error("Confira os campos destacados.")} className="gap-5 px-5 py-5 md:px-8 md:py-6">
            <EditFields onClose={setClose} />
        </Form> : <div className="flex flex-col-reverse gap-3 px-5 py-5 sm:flex-row md:px-8 md:py-6">
            <Button disabled={mutation.isPending} onClick={setClose} className="flex-1 border-2 border-j-gray-200 bg-j-white text-j-gray-600 hover:bg-j-gray-100 hover:text-j-gray-700">Cancelar</Button>
            {(action === "delete" || action === "cancel") ? <ConfirmButton onClick={confirm} disabled={mutation.isPending} className="flex-1">{mutation.isPending ? details.progress : details.label}</ConfirmButton>
                : <Button onClick={confirm} disabled={mutation.isPending} className="flex-1 bg-j-blue-700 text-j-white hover:bg-j-blue-800 hover:text-j-white">{mutation.isPending ? details.progress : details.label}</Button>}
        </div>}
    </div>;
}