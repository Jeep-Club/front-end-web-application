"use client";

import Link from "next/link";
import { getActionFailure } from "@/utils/http/ActionError";
import { Button, ButtonIcon } from "@/components/common/button";
import { Form } from "@/components/common/form";
import { PublicationGalleryFields } from "@/components/pages/publications/PublicationGalleryFields";
import type { PublicationGalleryItem } from "@/utils/publications/gallery";
import { InputRegister } from "@/components/common/input/input-register";
import { RichTextRegister } from "@/components/common/rich-text/RichTextRegister";
import { SelectRegister } from "@/components/common/select/select-register";
import { publicationCreationTypes } from "@/config/publicationCreation";
import { useModal } from "@/providers/ModalProvider";
import { publicationFormSchema, parseEventChargeRows, type CreatePublicationRequest, type PublicationFormData } from "@/schemas/publications/create";
import { uploadImageAction } from "@/server/actions/media/upload-image";
import { createPublicationAction } from "@/server/actions/publications/create";
import { useUserStore } from "@/stores/userStore";
import { maskPhoneNumber, unMaskPhoneNumber } from "@/utils/masks/maskPhoneNumber";
import { mutateDraftPublicationAction } from "@/server/actions/publications/draft";
import { maskServiceAmount } from "@/utils/masks/maskServiceAmount";
import { hasPermission } from "@/utils/permission/hasPermission";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Newspaper, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

import toast from "react-hot-toast";
import { EventChargeFields } from "./EventChargeFields";
import { invalidatePublicationAdministration } from "@/utils/publications/administration";
import styles from "./CreatePublicationModal.module.css";

function Fields({ initialType, publishEventImmediately, serverError }: { initialType?: PublicationFormData["type"]; publishEventImmediately: boolean; serverError?: unknown }) {
    const { setClose } = useModal();
    const { watch, setValue, setError, formState: { isSubmitting, errors } } = useFormContext<PublicationFormData>();
    const type = watch("type");
    useEffect(() => {
        for (const issue of getActionFailure(serverError)?.errors ?? []) {
            const field = issue.field;
            if (field === 'title' || field === 'content' || field === 'startsAt' || field === 'endsAt' || field === 'amount' || field === 'contactPhone') setError(field, { type: 'server', message: issue.message });
            else if (field.startsWith('images')) setError('photos', { type: 'server', message: issue.message });
            else if (field.startsWith('charges')) setError('charges', { type: 'server', message: issue.message });
        }
    }, [serverError, setError]);
    const [gallery, setGallery] = useState<PublicationGalleryItem[]>([]);
    const [primaryId, setPrimaryId] = useState('');
    const permissions = useUserStore((state) => state.permissions);
    const types = publicationCreationTypes.filter((entry) => hasPermission(permissions, "PUBLICATIONS", entry.action));
    const canPublishEvent = hasPermission(permissions, "PUBLICATIONS", "EVENT_PUBLISH");
    return (
        <>
            <fieldset disabled={isSubmitting} className={`${styles.fields} [&_select]:!bg-input-bg [&_select]:!text-input-text flex w-full min-w-0 flex-col gap-5`}>
                <div className="flex flex-col gap-4 rounded-2xl border border-j-gray-200 bg-j-gray-100/60 p-4 md:p-5">
                {!initialType && <SelectRegister name="type" label="Tipo de publicação" required>
                    {types.map((entry) => <option key={entry.type} value={entry.type}>{entry.label}</option>)}
                </SelectRegister>}
                <p className="text-sm text-j-gray-500">{type === "SERVICE" ? "O serviço será enviado para aprovação e aparecerá no feed após ser aprovado. É necessário ter associação ativa." : "A publicação será salva como rascunho. Publicar no feed é uma ação separada."}</p>
                </div>
                <div className="flex flex-col gap-4 rounded-2xl border border-j-gray-200 bg-j-gray-100/60 p-4 md:p-5">
                <InputRegister name="title" label="Título" maxLength={200} required />
                <RichTextRegister name="content" label="Conteúdo" required />
                {type === "EVENT" && <>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <InputRegister name="startsAt" label="Início" type="datetime-local" required />
                        <InputRegister name="endsAt" label="Término (opcional)" type="datetime-local" />
                    </div>
                    <p className="text-xs text-j-gray-500">Use o horário local. O fuso usado é o do navegador.</p>
                </>}
                {type === "EVENT" && <EventChargeFields disabled={isSubmitting} />}
                {type === "SERVICE" && <div className="grid gap-4 sm:grid-cols-2">
                    <InputRegister name="amount" label="Valor anunciado (R$)" inputMode="decimal" mask={maskServiceAmount} placeholder="100,00" required />
                    <InputRegister name="contactPhone" label="Telefone de contato" type="tel" inputMode="numeric" mask={maskPhoneNumber} placeholder="(00) 00000-0000" maxLength={15} required />
                </div>}
                </div>
                <div className="flex min-w-0 flex-col gap-4 rounded-2xl border border-j-gray-200 bg-j-gray-100/60 p-4 md:p-5">
                <PublicationGalleryFields items={gallery} primaryId={primaryId} disabled={isSubmitting} error={errors.photos?.message || errors.primaryIndex?.message} onChange={(items, primary) => {
                    setGallery(items); setPrimaryId(primary);
                    setValue('photos', items.flatMap(item => item.kind === 'file' ? [item.file] : []), { shouldDirty: true, shouldValidate: true });
                    setValue('primaryIndex', String(items.findIndex(item => item.id === primary)), { shouldDirty: true, shouldValidate: true });
                }} />
                </div>
            </fieldset>
            <div className="flex w-full flex-col-reverse gap-3 border-t border-j-gray-200 pt-5 sm:flex-row">
                <Button disabled={isSubmitting} onClick={setClose} className="flex-1 border-2 border-j-gray-200 bg-j-white text-j-gray-600 hover:border-j-gray-300 hover:bg-j-gray-100 hover:text-j-gray-700">Cancelar</Button>
            <Button type="submit" disabled={isSubmitting || !types.some((entry) => entry.type === type)} className="flex-1 bg-j-blue-700 text-j-white hover:bg-j-blue-800 hover:text-j-white">
                {isSubmitting ? "Salvando..." : type === "SERVICE" ? "Enviar para aprovação" : type === "EVENT" && publishEventImmediately && canPublishEvent ? "Criar e publicar evento" : type === "EVENT" ? "Criar evento" : "Criar rascunho"}
            </Button>
            </div>
        </>
    );
}

export function CreatePublicationModal({ initialType, publishEventImmediately = false }: { initialType?: PublicationFormData["type"]; publishEventImmediately?: boolean }) {
    const { setClose } = useModal();
    const permissions = useUserStore((state) => state.permissions);
    const types = publicationCreationTypes.filter((entry) => hasPermission(permissions, "PUBLICATIONS", entry.action));
    const uploads = useRef(new Map<File, string>());
    const queryClient = useQueryClient();
    const dialog = useRef<HTMLDialogElement>(null);
    const pending = useRef(false);
    const [createdResult, setCreatedResult] = useState<{ id: number; type: 'EVENT' | 'NOTICE' | 'SERVICE'; published: boolean; publishError?: string }>();
    useEffect(() => {
        const element = dialog.current;
        const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        element?.showModal();
        const escape = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;
            // WebKit may dispatch Escape outside the focused control after it becomes disabled.
            // Prevent native cancellation as well as the provider listener while a write is pending.
            if (pending.current) { event.preventDefault(); event.stopImmediatePropagation(); }
            else if (event.target instanceof Node && !element?.contains(event.target)) event.stopImmediatePropagation();
        };
        document.addEventListener('keydown', escape, true);
        return () => { document.removeEventListener('keydown', escape, true); element?.close(); if (previous?.isConnected) previous.focus(); };
    }, []);
    const mutation = useMutation({
        mutationFn: async (data: PublicationFormData) => {
            const config = publicationCreationTypes.find((entry) => entry.type === data.type)!;
            if (!hasPermission(useUserStore.getState().permissions, "PUBLICATIONS", config.action)) throw new Error("Você não tem permissão para criar este tipo de publicação.");
            const images = [];
            for (const [position, file] of data.photos.entries()) {
                let storageKey = uploads.current.get(file);
                if (!storageKey) {
                    const form = new FormData();
                    form.set("file", file);
                    storageKey = await uploadImageAction(form);
                    uploads.current.set(file, storageKey);
                }
                images.push({ storageKey, position, primary: position === Number(data.primaryIndex) });
            }
            const common = { title: data.title, content: data.content, images };
            const payload: CreatePublicationRequest = data.type === "EVENT"
                ? { ...common, type: "EVENT", startsAt: new Date(data.startsAt).toISOString(), endsAt: data.endsAt ? new Date(data.endsAt).toISOString() : null, charges: parseEventChargeRows(data.charges ?? [], new Date(data.startsAt).toISOString()) }
                : data.type === "SERVICE"
                    ? { ...common, type: "SERVICE", amount: Number(data.amount.replace(",", ".")), contactPhone: unMaskPhoneNumber(data.contactPhone) }
                    : { ...common, type: "NOTICE" };
            const created = await createPublicationAction(payload);
            if (data.type === 'EVENT' && data.charges?.some(charge => charge.mode === 'inline')) void invalidatePublicationAdministration(queryClient, 'EVENT', created.id, { inline: true });
            if (created.type !== "EVENT" || !publishEventImmediately) return { ...created, published: false };

            const currentPermissions = useUserStore.getState().permissions;
            const canPublishEvent = hasPermission(currentPermissions, "PUBLICATIONS", "EVENT_PUBLISH");
            if (!canPublishEvent) return { ...created, published: false };

            try {
                await mutateDraftPublicationAction({ id: created.id, type: "EVENT", action: "publish" });
                return { ...created, published: true };
            } catch (error) {
                return { ...created, published: false, publishError: getActionFailure(error)?.message ?? (error instanceof Error ? error.message : "Não foi possível publicar o evento.") };
            }
        },
        onSuccess: (result) => {
            if (result.type === "SERVICE") toast.success("Solicitação enviada para aprovação!");
            else if (result.type === "EVENT" && result.published) toast.success("Evento criado e publicado no feed!");
            else if (result.type === "EVENT" && "publishError" in result && result.publishError) toast.error(`O evento foi salvo como rascunho, mas não foi publicado: ${result.publishError}`);
            else if (result.type === "EVENT" && publishEventImmediately) toast.success("Evento salvo como rascunho. Para aparecer no feed, publique em Gestão de publicações.");
            else toast.success("Rascunho criado com sucesso!");
            void queryClient.invalidateQueries({ queryKey: ["publications"] });
            setCreatedResult(result);
        },

    });
    useEffect(() => { pending.current = mutation.isPending; }, [mutation.isPending]);
    if (!types.length) return null;
    const title = initialType === "EVENT" ? "Criar evento" : initialType === "NOTICE" ? "Criar aviso" : initialType === "SERVICE" ? "Criar serviço" : "Criar publicação";
    const description = initialType === "EVENT"
        ? "Organize o próximo encontro do clube direto pelo mural."
        : initialType === "NOTICE"
            ? "Escreva um aviso para compartilhar com a comunidade do clube."
            : initialType === "SERVICE"
                ? "Cadastre um serviço para enviar à aprovação."
                : "Escolha o tipo e preencha os dados da publicação.";
    return (
        <dialog ref={dialog} onKeyDown={event => {
            if (event.key === 'Escape') event.stopPropagation();
            if (event.key !== 'Tab' || event.currentTarget.querySelector('[role="listbox"]')) return;
            const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button, input, textarea, select, [contenteditable="true"], [tabindex]')).filter(element => element.tabIndex >= 0 && !element.matches(':disabled') && !element.closest('[inert]') && element.getClientRects().length > 0);
            const first = controls[0]; const last = controls.at(-1);
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }} onCancel={event => { event.preventDefault(); if (!pending.current) setClose(); }} aria-modal="true" aria-labelledby="create-publication-title" className="m-auto border-0 p-0 text-j-gray-700 backdrop:bg-black/60 relative hidden open:flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-y-auto overflow-x-hidden rounded-3xl bg-j-white shadow-2xl">
            <ButtonIcon aria-label="Fechar" disabled={mutation.isPending} onClick={setClose} className="absolute right-4 top-4 z-10 rounded-full bg-j-gray-100 p-2 text-j-gray-600 hover:bg-j-gray-200 hover:text-j-blue-800 md:right-6 md:top-6"><X size={20} /></ButtonIcon>
            <header className="border-b border-j-gray-200 px-5 pb-5 pr-16 pt-6 md:px-8 md:pb-6 md:pr-20 md:pt-8">

                <div className="flex items-center gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-j-blue-800 text-j-yellow-300 shadow-sm"><Newspaper size={20} /></span><h2 id="create-publication-title" className="text-xl font-extrabold text-j-blue-800 md:text-2xl">{title}</h2></div>
                <p className="mt-2 text-sm text-j-gray-500">{description}</p>


            </header>
            {createdResult ? <div role="status" className="space-y-4 p-6"><p>{createdResult.type === 'SERVICE' ? 'Solicitação' : 'Publicação'} salva com ID <strong>#{createdResult.id}</strong>. Guarde este ID para consultar depois.</p>
                {createdResult.publishError && <p className="text-input-error-text">O rascunho foi salvo, mas a publicação falhou: {createdResult.publishError}. Não crie novamente; publique pelo detalhe.</p>}
                {createdResult.type !== 'SERVICE' && hasPermission(permissions, 'PUBLICATIONS', createdResult.type === 'EVENT' ? 'EVENT_READ_ADMIN' : 'NOTICE_READ') && <Link onClick={setClose} className="block cursor-pointer font-bold text-j-blue-800 underline" href={`/admin/publications/${createdResult.type === 'EVENT' ? 'event' : 'notice'}/${createdResult.id}`}>Administrar publicação #{createdResult.id}</Link>}
                <Button onClick={setClose}>Concluir</Button></div> : <Form<PublicationFormData> schema={publicationFormSchema} formOptions={{ defaultValues: { type: types.some((entry) => entry.type === initialType) ? initialType! : types[0].type, title: "", content: "", photos: [], charges: [], primaryIndex: "0", startsAt: "", endsAt: "", amount: "", contactPhone: "" } }} onSubmit={async (data) => { try { await mutation.mutateAsync(data); } catch { /* A mensagem é apresentada pelo onError. */ } }} onError={() => toast.error("Confira os campos destacados.")} className="px-5 py-5 md:px-8 md:py-6">
                {mutation.isError && <p role="alert" className="text-input-error-text">{getActionFailure(mutation.error)?.message ?? mutation.error.message}</p>}
                <Fields initialType={initialType} publishEventImmediately={publishEventImmediately} serverError={mutation.error} />
            </Form>}
        </dialog>
    );
}
