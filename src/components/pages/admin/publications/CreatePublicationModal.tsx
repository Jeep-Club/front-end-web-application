"use client";

import Link from "next/link";
import { getActionFailure } from "@/utils/http/ActionError";
import { Button, ButtonIcon } from "@/components/common/button";
import { Form } from "@/components/common/form";
import { PublicationGalleryFields } from "./PublicationGalleryFields";
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
import { maskServiceAmount, parseServiceAmount } from "@/utils/masks/maskServiceAmount";
import { hasPermission } from "@/utils/permission/hasPermission";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Newspaper, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { DatePicker } from "@/components/common/date-picker";
import { parseDate } from "@internationalized/date";

import toast from "react-hot-toast";
import { EventChargeFields } from "./EventChargeFields";
import { invalidatePublicationAdministration } from "@/utils/publications/administration";

function Fields({ initialType, publishEventImmediately, serverError, step, setStep }: { initialType?: PublicationFormData["type"]; publishEventImmediately: boolean; serverError?: unknown; step: "details" | "charges"; setStep: (step: "details" | "charges") => void }) {
    const { setClose } = useModal();
    const { watch, setValue, setError, clearErrors, trigger, control, formState: { isSubmitting, errors } } = useFormContext<PublicationFormData>();
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
            <div className="min-h-0 w-full flex-1 overflow-y-auto overscroll-contain px-4 py-6 md:px-6"><fieldset disabled={isSubmitting} className="w-full min-w-0"><div hidden={type === "EVENT" && step === "charges"} className="space-y-6">
                <div className="flex flex-col gap-4">
                {!initialType && <SelectRegister name="type" label="Tipo de publicação" required>
                    {types.map((entry) => <option key={entry.type} value={entry.type}>{entry.label}</option>)}
                </SelectRegister>}
                <p className="text-sm text-j-gray-500">{type === "SERVICE" ? "O serviço será enviado para aprovação e aparecerá no feed após ser aprovado. É necessário ter associação ativa." : "A publicação será salva como rascunho. Publicar no feed é uma ação separada."}</p>
                </div>
                <div className="flex flex-col gap-4">
                <InputRegister name="title" label="Título" maxLength={200} required />
                <RichTextRegister name="content" label="Conteúdo" required />
                {type === "EVENT" && <>
                    <div className="grid gap-5">
                        {(["startsAt", "endsAt"] as const).map(name => (
                            <Controller key={name} name={name} control={control} render={({ field, fieldState }) => {
                                const [date = "", time = ""] = field.value.split("T");
                                const required = name === "startsAt";
                                const errorId = `event-${name}-error`;
                                const update = (nextDate: string, nextTime: string) => {
                                    clearErrors(name);
                                    field.onChange(nextDate || nextTime ? `${nextDate}T${nextTime}` : "");
                                };
                                const inputClass = "min-h-11 w-full min-w-0 rounded-lg border border-input-border px-3 text-base [color-scheme:inherit] aria-invalid:border-red-500";

                                return (
                                    <fieldset className="min-w-0 space-y-2" disabled={isSubmitting}>
                                        <legend className="font-bold">{required ? "Início *" : "Término (opcional)"}</legend>
                                        <div className="grid gap-3 min-[420px]:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                                            <DatePicker
                                                label="Data"
                                                granularity="day"
                                                value={date ? parseDate(date) : null}
                                                onChange={value => update(value?.toString() ?? "", time)}
                                                onBlur={field.onBlur}
                                                isRequired={required}
                                                isDisabled={isSubmitting}
                                                isInvalid={!!fieldState.error}
                                                aria-describedby={fieldState.error ? errorId : undefined}
                                            />
                                            <label className="grid min-w-0 gap-1 text-sm">
                                                Hora
                                                <input type="time" value={time} onChange={event => update(date, event.target.value)} onBlur={field.onBlur} aria-required={required} aria-invalid={!!fieldState.error} aria-describedby={fieldState.error ? errorId : undefined} className={inputClass} />
                                            </label>
                                        </div>
                                        {fieldState.error && <p id={errorId} className="text-sm text-input-error-text">{fieldState.error.message}</p>}
                                    </fieldset>
                                );
                            }} />
                        ))}
                    </div>
                    <p className="text-xs text-j-gray-500">Use o horário local. O fuso usado é o do navegador.</p>
                </>}

                {type === "SERVICE" && <div className="grid gap-4 sm:grid-cols-2">
                    <InputRegister name="amount" label="Valor anunciado (R$)" inputMode="decimal" mask={maskServiceAmount} placeholder="100,00" required />
                    <InputRegister name="contactPhone" label="Telefone de contato" type="tel" inputMode="numeric" mask={maskPhoneNumber} placeholder="(00) 00000-0000" maxLength={15} required />
                </div>}
                </div>
                <div className="flex min-w-0 flex-col gap-4">
                <PublicationGalleryFields publicationType={type} items={gallery} primaryId={primaryId} disabled={isSubmitting} error={errors.photos?.message || errors.primaryIndex?.message} onChange={(items, primary) => {
                    setGallery(items); setPrimaryId(primary);
                    setValue('photos', items.flatMap(item => item.kind === 'file' ? [item.file] : []), { shouldDirty: true, shouldValidate: true });
                    setValue('primaryIndex', String(items.findIndex(item => item.id === primary)), { shouldDirty: true, shouldValidate: true });
                }} />
                </div>
            </div>{type === "EVENT" && step === "charges" && <EventChargeFields disabled={isSubmitting} />}</fieldset></div>
            <div className="flex w-full shrink-0 flex-col-reverse gap-3 border-t border-input-border bg-background px-4 py-4 sm:flex-row md:px-6">
                {type === "EVENT" && step === "charges" ? <Button disabled={isSubmitting} onClick={() => setStep('details')} className="flex-1 border border-input-border bg-button-secondary-bg text-button-secondary-text-hover hover:bg-button-secondary-bg-hover hover:text-button-secondary-text-hover focus-visible:text-button-secondary-text-hover">Voltar</Button> : <Button disabled={isSubmitting} onClick={setClose} className="flex-1 border border-input-border bg-button-secondary-bg text-button-secondary-text-hover hover:bg-button-secondary-bg-hover hover:text-button-secondary-text-hover focus-visible:text-button-secondary-text-hover">Cancelar</Button>}
            {type === "EVENT" && step === "details" ? <Button key="continue" disabled={isSubmitting} onClick={async () => { if (await trigger(['title', 'content', 'startsAt', 'endsAt', 'photos', 'primaryIndex'])) setStep('charges'); }} className="flex-1">Continuar para cobranças</Button> : <Button key="submit" type="submit" disabled={isSubmitting || !types.some((entry) => entry.type === type)} className="flex-1 bg-button-primary-bg text-button-primary-text hover:bg-button-primary-bg-hover hover:text-button-primary-text-hover focus-visible:text-button-primary-text-hover">
                {isSubmitting ? "Salvando..." : type === "SERVICE" ? "Enviar para aprovação" : type === "EVENT" && publishEventImmediately && canPublishEvent ? "Divulgar evento" : "Salvar rascunho"}
            </Button>}
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
    const pickerWasOpen = useRef(false);
    const [step, setStep] = useState<'details' | 'charges'>('details');
    const [createdResult, setCreatedResult] = useState<{ id: number; type: 'EVENT' | 'NOTICE' | 'SERVICE'; published: boolean; publishError?: string }>();
    useEffect(() => {
        const element = dialog.current;
        const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        element?.showModal();
        if (element && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            const isMobile = window.matchMedia("(width < 40rem)").matches;
            element.animate(
                [
                    { opacity: 0, transform: isMobile ? "translateY(24px)" : "translateY(12px) scale(0.97)" },
                    { opacity: 1, transform: "none" },
                ],
                { duration: 250, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
            );
        }
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
            if (!hasPermission(useUserStore.getState().permissions, "PUBLICATIONS", config.action)) throw new Error("Você não tem permissão para divulgar este tipo de publicação.");
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
                    ? { ...common, type: "SERVICE", amount: parseServiceAmount(data.amount), contactPhone: unMaskPhoneNumber(data.contactPhone) }
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
    const title = initialType === "EVENT" ? "Divulgar evento" : initialType === "NOTICE" ? "Divulgar aviso" : initialType === "SERVICE" ? "Divulgar serviço" : "Divulgar publicação";
    const description = initialType === "EVENT"
        ? "Organize o próximo encontro do clube direto pelo mural."
        : initialType === "NOTICE"
            ? "Escreva um aviso para compartilhar com a comunidade do clube."
            : initialType === "SERVICE"
                ? "Cadastre um serviço para enviar à aprovação."
                : "Escolha o tipo e preencha os dados da publicação.";
    return (
        <dialog ref={dialog} onPointerDownCapture={event => { pickerWasOpen.current = !!event.currentTarget.querySelector('.jeep-calendar-popover'); }} onClick={event => {
            if (event.target !== event.currentTarget || pending.current || pickerWasOpen.current) return;
            const bounds = event.currentTarget.getBoundingClientRect();
            if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) setClose();
        }} onKeyDown={event => {
            if (event.key === 'Escape') event.stopPropagation();
            if (event.key !== 'Tab' || event.currentTarget.querySelector('[role="listbox"]')) return;
            const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button, input, textarea, select, [contenteditable="true"], [tabindex]')).filter(element => element.tabIndex >= 0 && !element.matches(':disabled') && !element.closest('[inert]') && element.getClientRects().length > 0);
            const first = controls[0]; const last = controls.at(-1);
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }} onCancel={event => { event.preventDefault(); if (!pending.current) setClose(); }} aria-modal="true" aria-labelledby="create-publication-title" className="m-auto border-0 p-0 text-primary backdrop:bg-black/60 relative hidden open:flex max-h-[92dvh] w-full max-w-[800px] flex-col overflow-hidden rounded-3xl bg-background max-sm:fixed max-sm:inset-0 max-sm:m-0 max-sm:h-dvh max-sm:max-h-dvh max-sm:max-w-none max-sm:rounded-none shadow-2xl">
            <ButtonIcon aria-label="Fechar" disabled={mutation.isPending} onClick={setClose} className="absolute right-4 top-4 z-10 rounded-full bg-background-secondary p-2 text-secondary hover:bg-background-tertiary hover:text-primary md:right-6 md:top-6"><X size={20} /></ButtonIcon>
            <header className="shrink-0 border-b border-input-border px-4 py-4 pr-16 md:px-6 md:py-6 md:pr-20">

                <div className="flex items-center gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-j-blue-800 text-j-yellow-300 shadow-sm"><Newspaper size={20} /></span><h2 id="create-publication-title" className="text-xl font-extrabold text-primary md:text-2xl">{title}</h2></div>
                <p className="mt-2 text-sm text-secondary">{description}</p>


            </header>
            {createdResult ? <div role="status" className="space-y-4 p-6"><p>{createdResult.type === 'SERVICE' ? 'Solicitação' : 'Publicação'} salva com ID <strong>#{createdResult.id}</strong>. Guarde este ID para consultar depois.</p>
                {createdResult.publishError && <p className="text-input-error-text">O rascunho foi salvo, mas a publicação falhou: {createdResult.publishError}. Não crie novamente; publique pelo detalhe.</p>}
                {createdResult.type !== 'SERVICE' && hasPermission(permissions, 'PUBLICATIONS', createdResult.type === 'EVENT' ? 'EVENT_READ_ADMIN' : 'NOTICE_READ') && <Link onClick={setClose} className="block cursor-pointer font-bold text-j-blue-800 underline" href={`/admin/publications/${createdResult.type === 'EVENT' ? 'event' : 'notice'}/${createdResult.id}`}>Administrar publicação #{createdResult.id}</Link>}
                <Button onClick={setClose}>Concluir</Button></div> : <Form<PublicationFormData> schema={publicationFormSchema} formOptions={{ defaultValues: { type: types.some((entry) => entry.type === initialType) ? initialType! : types[0].type, title: "", content: "", photos: [], charges: [], primaryIndex: "0", startsAt: "", endsAt: "", amount: "", contactPhone: "" } }} onSubmit={async (data) => { if (data.type === "EVENT" && step !== "charges") { setStep("charges"); return; } try { await mutation.mutateAsync(data); } catch { /* A mensagem é apresentada pelo onError. */ } }} onError={() => toast.error("Confira os campos destacados.")} className="min-h-0 flex-1 gap-0 overflow-hidden">
                {mutation.isError && <p role="alert" className="text-input-error-text">{getActionFailure(mutation.error)?.message ?? mutation.error.message}</p>}
                <Fields initialType={initialType} publishEventImmediately={publishEventImmediately} serverError={mutation.error} step={step} setStep={setStep} />
            </Form>}
        </dialog>
    );
}
