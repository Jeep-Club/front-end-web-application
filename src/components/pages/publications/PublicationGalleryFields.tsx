'use client';
import { useEffect, useId, useRef } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { InputFile } from '@/components/common/input/file';
import { GripVertical, Trash2 } from 'lucide-react';
import { Button as AriaButton, DropIndicator, GridList, GridListItem, useDragAndDrop } from 'react-aria-components';
import { getMediaImageUrl } from '@/utils/media/imageUrl';
import type { PublicationGalleryItem } from '@/utils/publications/gallery';

function Preview({ item }: { item: PublicationGalleryItem }) {
    const ref = useRef<HTMLImageElement>(null);
    useEffect(() => {
        const image = ref.current;
        if (!image) return;
        const url = item.kind === 'saved' ? getMediaImageUrl(item.storageKey) : URL.createObjectURL(item.file);
        image.src = url;
        return () => { if (item.kind === 'file') URL.revokeObjectURL(url); };
    }, [item]);
    // Both saved images and temporary previews use the existing authenticated proxy/object URL respectively.
    // eslint-disable-next-line @next/next/no-img-element
    return <img ref={ref} alt="" className="size-[72px] shrink-0 rounded-lg object-cover" />;
}

/** Controlled domain gallery: identity and cover are independent of array order. New-file picker retains its existing crop flow. */
export function PublicationGalleryFields({ items, primaryId, onChange, disabled = false, error, publicationType }: {
    items: PublicationGalleryItem[]; primaryId: string; onChange: (items: PublicationGalleryItem[], primaryId: string) => void; disabled?: boolean; error?: string; publicationType?: 'EVENT' | 'NOTICE' | 'SERVICE';
}) {
    const id = useId();
    const picker = useForm<{ files: File[] }>({ defaultValues: { files: [] } });
    const files = useWatch({ control: picker.control, name: 'files' });
    useEffect(() => {
        if (!files.length) return;
        const next = [...items, ...files.map(file => ({ id: crypto.randomUUID(), kind: 'file' as const, file }))].slice(0, 5);
        onChange(next, primaryId || next[0]?.id || '');
        picker.setValue('files', []);
    }, [files, items, primaryId, onChange, picker]);
    const { dragAndDropHooks } = useDragAndDrop<PublicationGalleryItem>({
        isDisabled: disabled,
        getItems: keys => [...keys].map(key => ({ 'text/plain': String(key) })),
        onReorder: event => {
            const moving = items.filter(item => event.keys.has(item.id));
            const remaining = items.filter(item => !event.keys.has(item.id));
            const index = remaining.findIndex(item => item.id === event.target.key);
            if (index < 0) return;
            remaining.splice(index + (event.target.dropPosition === 'after' ? 1 : 0), 0, ...moving);
            onChange(remaining, primaryId);
        },
        renderDropIndicator: target => <DropIndicator target={target} className="h-1 rounded bg-button-primary-bg opacity-0 data-[drop-target]:opacity-100" />,
    });
    const coverLabel = publicationType === 'EVENT' ? 'Capa do evento' : publicationType === 'NOTICE' ? 'Capa do aviso' : publicationType === 'SERVICE' ? 'Capa do serviço' : 'Capa';
    return <fieldset disabled={disabled} onKeyDownCapture={event => {
        const target = event.target as HTMLElement;
        if (!target.closest('button[slot="drag"]') || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) return;
        const key = target.closest('[data-key]')?.getAttribute('data-key');
        const index = items.findIndex(item => item.id === key);
        const destination = index + (event.key === 'ArrowUp' ? -1 : 1);
        event.preventDefault(); event.stopPropagation();
        if (index < 0 || destination < 0 || destination >= items.length) return;
        const next = [...items];
        [next[index], next[destination]] = [next[destination], next[index]];
        const fieldset = event.currentTarget;
        onChange(next, primaryId);
        requestAnimationFrame(() => fieldset.querySelector<HTMLElement>(`[data-key="${CSS.escape(key!)}"] button[slot="drag"]`)?.focus());
    }} aria-describedby={`${id}-help${error ? ` ${id}-error` : ''}`} className="w-full min-w-0 space-y-3">
        <legend className="font-bold text-primary">Galeria de imagens <span aria-hidden="true" className="text-input-error-text">*</span></legend>
        <p id={`${id}-help`} className="text-sm text-secondary">De 1 a 5 imagens JPEG, PNG ou WebP, até 5 MiB cada. Arraste ou use as setas para ordenar.</p>
        <GridList aria-label="Imagens da publicação" items={items} dependencies={[primaryId, items, disabled]} dragAndDropHooks={dragAndDropHooks} className="space-y-2 outline-none">
            {(item) => <GridListItem id={item.id} textValue={item.kind === 'file' ? item.file.name : item.storageKey.split('/').pop() ?? 'Imagem salva'} className={`flex min-w-0 items-center gap-3 rounded-lg cursor-grab border p-3 outline-none data-[dragging]:opacity-50 data-[focus-visible]:outline-2 data-[focus-visible]:outline-input-border-focus ${primaryId === item.id ? 'border-button-primary-bg bg-background-secondary' : 'border-input-border'}`}>
                <AriaButton slot="drag" aria-label={`Reordenar ${item.kind === 'file' ? item.file.name : item.storageKey.split('/').pop() ?? 'imagem'}`} isDisabled={disabled} className="cursor-grab touch-none rounded p-2 text-secondary focus-visible:outline-2 focus-visible:outline-input-border-focus disabled:cursor-not-allowed"><GripVertical size={18} aria-hidden="true" /></AriaButton>
                <Preview item={item} />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-primary">{item.kind === 'file' ? item.file.name : item.storageKey.split('/').pop() ?? 'Imagem salva'}</p>
                    {primaryId === item.id ? <span className="mt-1 inline-block rounded bg-background-tertiary px-2 py-1 text-xs font-semibold text-primary">{coverLabel}</span> : <button type="button" disabled={disabled} onClick={() => onChange(items, item.id)} className="mt-1 cursor-pointer rounded text-xs font-semibold text-primary underline focus-visible:outline-2 focus-visible:outline-input-border-focus disabled:cursor-not-allowed">Definir como capa</button>}
                </div>
                <button type="button" disabled={disabled} aria-label={`Remover imagem ${items.findIndex(entry => entry.id === item.id) + 1}`} onClick={() => { const next = items.filter(entry => entry.id !== item.id); onChange(next, item.id === primaryId ? next[0]?.id ?? '' : primaryId); }} className="cursor-pointer rounded p-2 text-input-error-text hover:bg-background-tertiary focus-visible:outline-2 focus-visible:outline-input-border-focus disabled:cursor-not-allowed"><Trash2 size={18} aria-hidden="true" /></button>
            </GridListItem>}
        </GridList>
        {items.length < 5 && <FormProvider {...picker}><div inert={disabled}><InputFile.Image name="files" label="Adicionar imagens" maxFiles={5 - items.length} maxSizeMB={5} cropShape="landscape" /></div></FormProvider>}
        {items.length === 5 && <p role="status">Limite de cinco imagens atingido.</p>}
        {error && <p id={`${id}-error`} role="alert" className="text-input-error-text">{error}</p>}
    </fieldset>;
}
