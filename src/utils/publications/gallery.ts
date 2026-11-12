export type PublicationGalleryItem = { id: string } & ({ kind: 'saved'; storageKey: string } | { kind: 'file'; file: File });

/** Upload only new files. The caller keeps this cache across retries; removing a reference never deletes storage. */
export async function resolvePublicationGallery(items: PublicationGalleryItem[], primaryId: string, cache: Map<File, string>, upload: (form: FormData) => Promise<string>) {
    const images = [];
    for (const [position, item] of items.entries()) {
        let storageKey = item.kind === 'saved' ? item.storageKey : cache.get(item.file);
        if (!storageKey && item.kind === 'file') {
            const form = new FormData();
            form.set('file', item.file);
            storageKey = await upload(form);
            cache.set(item.file, storageKey);
        }
        if (!storageKey) throw new Error('Não foi possível enviar a imagem.');
        images.push({ storageKey, position, primary: item.id === primaryId });
    }
    return images;
}
