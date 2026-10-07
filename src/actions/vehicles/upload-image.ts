'use server';

import { getAuthCookies } from "@/utils/auth/get";
import { frontendHeaders } from '@/services/fetchWrapper/frontendHeaders';
import fetchRefreshToken from "@/utils/auth/refresh";
import { login } from "@/utils/auth/login";
import { extractApiErrorMessage, SESSION_EXPIRED_MESSAGE } from "@/utils/http/apiError";

interface ImageUploadResponse {
    storageKey: string;
    url: string;
}

/**
 * Envia uma imagem para o backend Spring Boot através da rota `POST /media/images`.
 * Retorna a chave estável do storage (ex: "images/2026/09/24/uuid.png") que é esperada
 * pelo aggregate Vehicle no campo `photo` (com validação `images.requireExisting(photo)`).
 */
export async function uploadVehicleImageAction(data: FormData | string): Promise<string> {
    const apiURL = process.env.API_URL;
    if (!apiURL) {
        throw new Error("API_URL não está configurada");
    }

    let formDataToSend: FormData;

    if (typeof data === "string") {
        const trimmed = data.trim();

        // Se já for uma chave de storage do backend, retorna a chave limpa
        if (trimmed.startsWith("images/")) {
            return trimmed;
        }

        if (trimmed.startsWith("/media/images?key=")) {
            return trimmed.replace("/media/images?key=", "");
        }

        // Se for URL externa pré-existente
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            return trimmed;
        }

        // Se for string Base64 (data:image/...)
        if (trimmed.startsWith("data:image/")) {
            const matches = trimmed.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
            if (!matches) {
                throw new Error("Formato de imagem Base64 inválido");
            }

            const rawExt = matches[1].toLowerCase();
            const ext = rawExt === "jpeg" ? "jpg" : rawExt;
            const mimeType = `image/${ext === "jpg" ? "jpeg" : ext}`;
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, "base64");
            const blob = new Blob([buffer], { type: mimeType });
            const filename = `vehicle_${Date.now()}.${ext}`;

            formDataToSend = new FormData();
            formDataToSend.append("file", blob, filename);
        } else {
            return trimmed;
        }
    } else {
        formDataToSend = data;
    }

    const file = formDataToSend.get("file");
    if (!file) {
        throw new Error("Nenhum arquivo de imagem encontrado para envio");
    }

    // Obter tokens de autenticação
    const authCookies = await getAuthCookies.SERVER();
    if (!authCookies?.AuthAccessToken) {
        throw new Error(SESSION_EXPIRED_MESSAGE);
    }

    let token = authCookies.AuthAccessToken;
    const expires = authCookies.AccessTokenExpiration;
    const isExpired = expires ? new Date(expires) < new Date() : true;

    if (isExpired && authCookies.AuthRefreshToken) {
        try {
            const refreshResponse = await fetchRefreshToken({
                ApiURL: apiURL,
                refreshToken: authCookies.AuthRefreshToken,
            });
            token = refreshResponse.accessToken;
            await login(
                refreshResponse.accessToken,
                refreshResponse.refreshToken,
                new Date(Date.now() + refreshResponse.expiresInSeconds * 1000).toISOString(),
            );
        } catch {
            throw new Error(SESSION_EXPIRED_MESSAGE);
        }
    }

    const response = await fetch(`${apiURL}/media/images`, {
        method: "POST",
        headers: frontendHeaders({
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        }),
        body: formDataToSend,
    });

    if (!response.ok) {
        const text = await response.text();
        let parsed: unknown = text;
        try {
            parsed = JSON.parse(text);
        } catch {}
        throw new Error(extractApiErrorMessage(parsed, "Erro ao enviar imagem do veículo para o backend"));
    }

    const result = (await response.json()) as ImageUploadResponse;
    if (!result.storageKey) {
        throw new Error("Resposta inválida do servidor ao salvar imagem");
    }

    return result.storageKey;
}
