'use server';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { ActionError } from '@/utils/http/ActionError';
import { z } from 'zod';

export async function uploadImageAction(formData: FormData): Promise<string> {
    const file = formData.get('file');
    if (!(file instanceof File) || !file.size) throw new ActionError('Selecione uma imagem para enviar.');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new ActionError('Formato inválido. Envie uma imagem JPEG, PNG ou WebP.');
    if (file.size > 5 * 1024 * 1024) throw new ActionError('A imagem deve ter no máximo 5 MiB.');
    const body = new FormData();
    body.set('file', file, file.name);
    const { data } = await actionFetchWrapper({
        url: 'media/images', method: 'POST', body, cache: 'no-store',
        schema: z.object({ storageKey: z.string().trim().min(1) }),
    });
    return data.storageKey;
}
