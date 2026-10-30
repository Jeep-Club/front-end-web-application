"use client";
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Button, ButtonIcon } from '@/components/common/button';
import { Form } from '@/components/common/form';
import { InputRegister } from '@/components/common/input/input-register';
import { RichTextRegister } from '@/components/common/rich-text/RichTextRegister';
import { PublicationGalleryFields } from '@/components/pages/publications/PublicationGalleryFields';
import { useModal } from '@/providers/ModalProvider';
import { eventChargeFormRowSchema, parseEventChargeRows } from '@/schemas/publications/create';
import { EventChargeFields } from './EventChargeFields';
import { draftEditorialSchema } from '@/schemas/publications/draft';
import { type EventChargeRule, type AdminEvent } from '@/schemas/publications/admin';
import { mutateDraftPublicationAction } from '@/server/actions/publications/draft';
import { mutatePublishedPublicationAction } from '@/server/actions/publications/published';
import { updateAdminEventAction } from '@/server/actions/publications/events';
import { updateAdminNoticeAction } from '@/server/actions/publications/notices';
import { deleteAdminServicePublicationAction } from '@/server/actions/publications/services';
import { uploadImageAction } from '@/server/actions/media/upload-image';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFormContext } from 'react-hook-form';
import { getActionFailure } from '@/utils/http/ActionError';
import { invalidatePublicationAdministration } from '@/utils/publications/administration';
import { resolvePublicationGallery, type PublicationGalleryItem } from '@/utils/publications/gallery';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

export interface DraftPublicationTarget { id: number; type: 'NOTICE' | 'EVENT' | 'SERVICE'; status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; title: string; content: string; images?: AdminEvent['images']; startsAt?: string; endsAt?: string | null; eventStatus?: AdminEvent['eventStatus']; chargeRules?: EventChargeRule[] }
const editSchema = draftEditorialSchema.extend({ startsAt: z.string(), endsAt: z.string(), charges: z.array(eventChargeFormRowSchema) });
type EditData = z.infer<typeof editSchema>;
const labels = { charges: 'Salvar regras financeiras', edit: 'Salvar alterações', publish: 'Publicar', delete: 'Excluir', archive: 'Arquivar', cancel: 'Cancelar evento', finish: 'Encerrar evento' };
function localTime(value?: string | null) { if (!value) return ''; const date = new Date(value); return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 19); }
// The clock is read by the resolver during validation, never while rendering the modal.
function makeEditSchema(publication: DraftPublicationTarget, action: keyof typeof labels, agendaLocked: boolean) {
    return editSchema.superRefine((values, ctx) => {
        if (action === 'charges' && publication.startsAt) {
            try { parseEventChargeRows(values.charges, publication.startsAt); }
            catch (error) { ctx.addIssue({ code: 'custom', path: ['charges'], message: error instanceof z.ZodError ? 'Confira as definições, valores, datas e a duplicidade das cobranças.' : error instanceof Error ? error.message : 'Confira as cobranças.' }); }
        }
        if (action !== 'edit' || publication.type !== 'EVENT' || agendaLocked || publication.eventStatus !== 'OPEN') return;
        const startChanged = values.startsAt !== localTime(publication.startsAt);
        const endChanged = values.endsAt !== localTime(publication.endsAt);
        if (startChanged && (!Number.isFinite(Date.parse(values.startsAt)) || Date.parse(values.startsAt) <= Date.now())) ctx.addIssue({ code: 'custom', path: ['startsAt'], message: 'Informe um início no futuro.' });
        if ((startChanged || endChanged) && values.endsAt && (!Number.isFinite(Date.parse(values.endsAt)) || Date.parse(values.endsAt) <= Date.parse(values.startsAt))) ctx.addIssue({ code: 'custom', path: ['endsAt'], message: 'O término deve ser posterior ao início.' });
    });
}
function EditFields({ publication, gallery, primaryId, onChange, galleryError, onClose, agendaLocked, serverError }: { publication: DraftPublicationTarget; gallery: PublicationGalleryItem[]; primaryId: string; onChange: (items: PublicationGalleryItem[], primary: string) => void; galleryError: string; onClose: () => void; agendaLocked: boolean; serverError?: unknown }) {
    const { setError, formState: { isSubmitting } } = useFormContext<EditData>();
    useEffect(() => {
        for (const issue of getActionFailure(serverError)?.errors ?? []) {
            if (issue.field === 'title' || issue.field === 'content' || issue.field === 'startsAt' || issue.field === 'endsAt') setError(issue.field, { type: 'server', message: issue.message });
        }
    }, [serverError, setError]);
    return <><fieldset disabled={isSubmitting} className="w-full min-w-0 space-y-4 [&_select]:!bg-input-bg [&_select]:!text-input-text">
        <InputRegister name="title" label="Título" required maxLength={200} /><RichTextRegister name="content" label="Conteúdo" required />
        {publication.type === 'EVENT' && <fieldset disabled={agendaLocked} className="space-y-3"><legend className="font-bold">Agenda</legend><p className="text-sm">Horários no fuso do navegador. Qualquer inscrição, inclusive cancelada, ou fato financeiro bloqueia a agenda e as cobranças. O servidor confirma a elegibilidade.</p>{agendaLocked && <p role="status">Agenda indisponível para edição neste estado ou pelos registros conhecidos.</p>}<InputRegister name="startsAt" label="Início" type="datetime-local" step="1" /><InputRegister name="endsAt" label="Término (opcional)" type="datetime-local" step="1" /></fieldset>}
        {publication.images && <PublicationGalleryFields items={gallery} primaryId={primaryId} onChange={onChange} disabled={isSubmitting} error={galleryError} />}
    </fieldset><div className="flex w-full flex-wrap gap-3"><Button disabled={isSubmitting} onClick={onClose}>Voltar</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar alterações'}</Button></div></>;
}
export function DraftPublicationActionModal({ publication, action, returnHref, agendaLocked = false }: { publication: DraftPublicationTarget; action: keyof typeof labels; returnHref?: string; agendaLocked?: boolean }) {
    const { setClose } = useModal();
    const router = useRouter();
    const client = useQueryClient();
    const dialog = useRef<HTMLDialogElement>(null);
    const pending = useRef(false);
    const cache = useRef(new Map<File, string>());
    const [gallery, setGallery] = useState<PublicationGalleryItem[]>(() => (publication.images ?? []).map(image => ({ kind: 'saved', id: image.storageKey, storageKey: image.storageKey })));
    const [primaryId, setPrimary] = useState(publication.images?.find(image => image.primary)?.storageKey ?? '');
    const [galleryError, setGalleryError] = useState('');
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
        mutationFn: async (values?: EditData) => {
            if (action === 'charges' && values) {
                if (!publication.startsAt || !publication.chargeRules) throw new Error('Releia o evento e suas regras antes de configurar.');
                const charges = parseEventChargeRows(values.charges, publication.startsAt);
                const original = publication.chargeRules.map(rule => ({ chargeDefinitionId: rule.chargeDefinitionId, requiredForParticipation: rule.requiredForParticipation, participationCutoff: rule.participationCutoff, ...(rule.financialDueDate ? { financialDueDate: rule.financialDueDate } : {}) }));
                if (JSON.stringify(charges) !== JSON.stringify(original)) await updateAdminEventAction(publication.id, { charges });
            } else if (action === 'edit' && values) {
                const patch: { title?: string; content?: string; images?: AdminEvent['images']; startsAt?: string; endsAt?: string | null } = {};
                if (values.title !== publication.title) patch.title = values.title;
                if (values.content !== publication.content) patch.content = values.content;
                if (publication.images) {
                    if (!gallery.length || !gallery.some(item => item.id === primaryId)) { setGalleryError('Envie de 1 a 5 imagens e escolha a capa.'); throw new Error('Confira a galeria.'); }
                    const images = await resolvePublicationGallery(gallery, primaryId, cache.current, uploadImageAction);
                    if (JSON.stringify(images) !== JSON.stringify(publication.images)) patch.images = images;
                }
                if (publication.type === 'EVENT') {
                    if (!agendaLocked && publication.eventStatus === 'OPEN') {
                        if (values.startsAt !== localTime(publication.startsAt)) patch.startsAt = new Date(values.startsAt).toISOString();
                        if (values.endsAt !== localTime(publication.endsAt)) patch.endsAt = values.endsAt ? new Date(values.endsAt).toISOString() : null;
                    }
                    await updateAdminEventAction(publication.id, patch);
                } else if (publication.type === 'NOTICE') {
                    await updateAdminNoticeAction(publication.id, patch);
                }
            } else {
                const input = { id: publication.id, type: publication.type, action };
                if (action === 'publish' && publication.type !== 'SERVICE') await mutateDraftPublicationAction({ ...input, type: publication.type, action: 'publish' });
                else if (action === 'delete' && publication.type === 'SERVICE') await deleteAdminServicePublicationAction(publication.id);
                else if (action === 'delete') await mutatePublishedPublicationAction({ ...input, action: 'delete' });
                else if (action === 'cancel' || action === 'finish') await mutatePublishedPublicationAction({ ...input, type: 'EVENT', action });
                else if (action === 'archive') await mutatePublishedPublicationAction({ ...input, type: 'NOTICE', action });
            }
        },
        onError: async error => { if (getActionFailure(error)?.status === 409) await invalidatePublicationAdministration(client, publication.type, publication.id); },
        onSuccess: async () => {
            await invalidatePublicationAdministration(client, publication.type, publication.id, { deleted: action === 'delete', billing: action === 'cancel', inline: action === 'charges' });
            toast.success(action === 'edit' ? 'Publicação atualizada!' : 'Operação concluída!');
            setClose();
            if (action === 'delete' && returnHref) router.push(returnHref);
        },
    });
    useEffect(() => { pending.current = mutation.isPending; }, [mutation.isPending]);
    const descriptions = {
        charges: 'Você substituirá todas as regras. A coleção vazia remove as regras, mas preserva definições e fatos financeiros. Qualquer inscrição ou fato financeiro bloqueia a alteração.',
        archive: 'O aviso sairá do feed. O arquivamento é terminal; guarde seu ID para consultar. Não será possível editar ou republicar.',
        cancel: 'Cancela a operação e obrigações abertas dos ciclos financeiros próprios, com elegibilidade de reembolso. Não realiza reembolso automático nem apaga pagamentos. A publicação e os estados das inscrições não são removidos automaticamente.',
        finish: 'Encerra somente a operação. Não arquiva a publicação nem encerra ciclos financeiros; o evento pode continuar no feed.',
        delete: 'Exclusão irreversível pela interface. Preserva histórico e arquivos globais. Excluir não equivale a cancelar finanças nem reembolsar. Serviços mantêm pedidos e propostas; aprovações posteriores podem falhar por ausência do serviço.',
        publish: 'O conteúdo ficará disponível no feed dos associados.', edit: 'Altere apenas os campos necessários.',
    };
    return <dialog ref={dialog} onKeyDown={event => {
            if (event.key === 'Escape') event.stopPropagation();
            if (event.key !== 'Tab' || event.currentTarget.querySelector('[role="listbox"]')) return;
            const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button, input, textarea, select, [contenteditable="true"], [tabindex]')).filter(element => element.tabIndex >= 0 && !element.matches(':disabled') && !element.closest('[inert]') && element.getClientRects().length > 0);
            const first = controls[0]; const last = controls.at(-1);
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }} onCancel={event => { event.preventDefault(); if (!pending.current) setClose(); }} aria-modal="true" aria-labelledby="publication-action-title" className="m-auto hidden max-h-[92dvh] w-full max-w-3xl flex-col overflow-y-auto rounded-3xl border-0 bg-j-white p-5 text-j-gray-700 shadow-2xl backdrop:bg-black/60 open:flex md:p-8">
        <header className="mb-5 flex items-start justify-between gap-3"><div><h2 id="publication-action-title" className="text-xl font-bold text-j-blue-800">{action === 'edit' ? 'Editar publicação' : `${labels[action]}?`}</h2><p className="mt-2 break-words font-bold">{publication.title}</p></div><ButtonIcon aria-label="Fechar" disabled={mutation.isPending} onClick={setClose}><X /></ButtonIcon></header>
        <p className="mb-5">{descriptions[action]}</p>
        {mutation.isError && <p role="alert" className="mb-4 text-input-error-text">{getActionFailure(mutation.error)?.message ?? mutation.error.message}{getActionFailure(mutation.error)?.status === 409 ? ' Os dados foram relidos. Feche e reabra para comparar com a versão atual; os valores digitados foram preservados.' : ''}</p>}
        {action === 'edit' || action === 'charges' ? <Form<EditData> schema={makeEditSchema(publication, action, agendaLocked)} formOptions={{ defaultValues: { title: publication.title, content: publication.content, startsAt: localTime(publication.startsAt), endsAt: localTime(publication.endsAt), charges: (publication.chargeRules ?? []).map(rule => ({ mode: 'existing' as const, chargeDefinitionId: String(rule.chargeDefinitionId), name: '', description: '', amount: '', billingRequired: false, requiredForParticipation: rule.requiredForParticipation, participationCutoff: rule.participationCutoff, financialDueDate: rule.financialDueDate ?? '', paymentAcceptancePolicy: '' })) } }} onSubmit={async values => { try { await mutation.mutateAsync(values); } catch { /* Global Query handler reports the public failure. Values remain mounted. */ } }} onError={() => {}}>{action === 'charges' ? <><EventChargeFields disabled={mutation.isPending || agendaLocked} /><Button type="submit" disabled={mutation.isPending || agendaLocked}>{mutation.isPending ? 'Salvando...' : 'Salvar regras financeiras'}</Button></> : <EditFields serverError={mutation.error} publication={publication} gallery={gallery} primaryId={primaryId} galleryError={galleryError} agendaLocked={agendaLocked || publication.eventStatus !== 'OPEN'} onChange={(items, primary) => { setGallery(items); setPrimary(primary); setGalleryError(''); }} onClose={setClose} />}</Form>
            : <div className="flex flex-wrap gap-3"><Button disabled={mutation.isPending} onClick={setClose}>Voltar</Button><Button disabled={mutation.isPending} aria-busy={mutation.isPending} onClick={() => mutation.mutate(undefined)}>{mutation.isPending ? 'Processando...' : labels[action]}</Button></div>}
    </dialog>;
}
