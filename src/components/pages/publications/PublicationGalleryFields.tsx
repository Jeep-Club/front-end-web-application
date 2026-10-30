'use client';
import { useEffect, useId, useRef } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { InputFile } from '@/components/common/input/file';
import { Button } from '@/components/common/button';
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
    return <img ref={ref} alt="" className="aspect-video w-full rounded-lg object-cover" />;
}

/** Controlled domain gallery: identity and cover are independent of array order. New-file picker retains its existing crop flow. */
export function PublicationGalleryFields({ items, primaryId, onChange, disabled = false, error }: {
    items: PublicationGalleryItem[]; primaryId: string; onChange: (items: PublicationGalleryItem[], primaryId: string) => void; disabled?: boolean; error?: string;
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
    function reorder(index: number, offset: number) {
        const next = [...items];
        [next[index], next[index + offset]] = [next[index + offset], next[index]];
        onChange(next, primaryId);
    }
    return <fieldset disabled={disabled} aria-describedby={`${id}-help${error ? ` ${id}-error` : ''}`} className="w-full min-w-0 space-y-3">
        <legend className="font-bold text-j-blue-800">Galeria de imagens</legend>
        <p id={`${id}-help`} className="text-sm">De 1 a 5 imagens JPEG, PNG ou WebP, até 5 MiB cada. Remover uma referência não apaga o arquivo global.</p>
        <ol className="grid min-w-0 gap-3 sm:grid-cols-2">{items.map((item, index) => <li key={item.id} className="min-w-0 space-y-2 rounded-lg border border-j-gray-200 p-3">
            <Preview item={item} /><p className="break-all text-sm">Imagem {index + 1}{item.kind === 'file' ? `: ${item.file.name}` : ' · salva'}</p>
            <label className="flex cursor-pointer items-center gap-2"><input type="radio" name={`${id}-cover`} checked={primaryId === item.id} onChange={() => onChange(items, item.id)} />Capa da imagem {index + 1}</label>
            <div className="flex flex-wrap gap-2"><Button aria-label={`Mover imagem ${index + 1} para cima`} disabled={disabled || index === 0} onClick={() => reorder(index, -1)}>Subir</Button><Button aria-label={`Mover imagem ${index + 1} para baixo`} disabled={disabled || index === items.length - 1} onClick={() => reorder(index, 1)}>Descer</Button><Button aria-label={`Remover imagem ${index + 1}`} onClick={() => { const next = items.filter(entry => entry.id !== item.id); onChange(next, item.id === primaryId ? next[0]?.id ?? '' : primaryId); }}>Remover</Button></div>
        </li>)}</ol>
        {items.length < 5 && <FormProvider {...picker}><div inert={disabled}><InputFile.Image name="files" label="Adicionar imagens" maxFiles={5 - items.length} maxSizeMB={5} cropShape="landscape" /></div></FormProvider>}
        {items.length === 5 && <p role="status">Limite de cinco imagens atingido.</p>}
        {error && <p id={`${id}-error`} role="alert" className="text-input-error-text">{error}</p>}
    </fieldset>;
}
