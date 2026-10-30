import { resolvePublicationGallery } from '@/utils/publications/gallery';
it('retém keys, preserva capa fora da primeira posição e reutiliza uploads após falha', async () => {
    const file = new File(['image'], 'image.png', { type: 'image/png' });
    const items = [{ id: 'saved', kind: 'saved' as const, storageKey: 'saved-key' }, { id: 'new', kind: 'file' as const, file }];
    const cache = new Map<File, string>();
    const upload = jest.fn().mockResolvedValue('new-key');
    const expected = [{ storageKey: 'saved-key', position: 0, primary: false }, { storageKey: 'new-key', position: 1, primary: true }];
    expect(await resolvePublicationGallery(items, 'new', cache, upload)).toEqual(expected);
    expect(await resolvePublicationGallery(items, 'new', cache, upload)).toEqual(expected);
    expect(upload).toHaveBeenCalledTimes(1);
});
