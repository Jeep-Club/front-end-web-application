'use server';

import { getAuthCookies } from '@/utils/auth/get';
import fetchRefreshToken from '@/utils/auth/refresh';
import { login } from '@/utils/auth/login';
import { extractApiErrorMessage, SESSION_EXPIRED_MESSAGE } from '@/utils/http/apiError';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

interface UploadResponse {
    storageKey?: string;
}

/** Upload autenticado compartilhado. Retorna somente a chave persistente do arquivo. */
export async function uploadImageAction(formData: FormData): Promise<string> {
    const file = formData.get('file');
    if (typeof File === "undefined" || !(file instanceof File) || file.size === 0) {
        throw new Error('Selecione uma imagem para enviar.');
    }
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        throw new Error('Formato inválido. Envie uma imagem JPEG, PNG ou WebP.');
    }
    if (file.size > MAX_IMAGE_SIZE) {
        throw new Error('A imagem deve ter no máximo 5 MiB.');
    }

    const apiURL = process.env.API_URL;
    if (!apiURL) throw new Error('API_URL não está configurada.');

    const cookies = await getAuthCookies.SERVER();
    if (!cookies?.AuthAccessToken) throw new Error(SESSION_EXPIRED_MESSAGE);

    let token = cookies.AuthAccessToken;
    const expired = !cookies.AccessTokenExpiration || new Date(cookies.AccessTokenExpiration) < new Date();
    if (expired && cookies.AuthRefreshToken) {
        try {
            const refreshed = await fetchRefreshToken({ ApiURL: apiURL, refreshToken: cookies.AuthRefreshToken });
            token = refreshed.accessToken;
            await login(refreshed.accessToken, refreshed.refreshToken,
                new Date(Date.now() + refreshed.expiresInSeconds * 1000).toISOString());
        } catch {
            throw new Error(SESSION_EXPIRED_MESSAGE);
        }
    }

    const upload = new FormData();
    upload.set('file', file, file.name);
    const response = await fetch(`${apiURL}/media/images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        body: upload,
        cache: 'no-store',
    });
    if (!response.ok) {
        const body = await response.text();
        let parsed: unknown = body;
        try { parsed = JSON.parse(body); } catch {}
        // This response is already the JSON problem body (unlike errors from
        // fetchWrapper, which wrap it in `rawData`). Preserve its backend detail.
        throw new Error(extractApiErrorMessage(
            { rawData: parsed },
            'Não foi possível enviar a imagem.',
        ));
    }

    const result = await response.json() as UploadResponse;
    if (!result.storageKey?.trim()) throw new Error('A API não retornou a chave da imagem.');
    return result.storageKey;
}
