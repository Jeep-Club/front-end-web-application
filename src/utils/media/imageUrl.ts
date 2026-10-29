/**
 * Resolve o caminho ou URL da imagem do storage do backend para exibição no frontend.
 *
 * O backend Spring Boot armazena imagens via `POST /media/images` e retorna chaves estáveis
 * como "images/2026/09/24/uuid.png".
 * Como o backend exige autenticação Bearer para `GET /media/images?key=...`, a rota interna
 * Next.js `/api/media/images?key=...` faz o proxy repassando os cookies de sessão com segurança.
 */
export function getMediaImageUrl(photo?: string | null): string {
    if (!photo || typeof photo !== "string") {
        return "";
    }

    const trimmed = photo.trim();
    if (!trimmed) {
        return "";
    }

    // URLs absolutas, data URLs ou blob URLs
    if (
        trimmed.startsWith("http://") ||
        trimmed.startsWith("https://") ||
        trimmed.startsWith("data:") ||
        trimmed.startsWith("blob:")
    ) {
        return trimmed;
    }

    // Já aponta para o proxy interno
    if (trimmed.startsWith("/api/media/images")) {
        return trimmed;
    }

    // Imagens locais estáticas (legado/fallback)
    if (trimmed.startsWith("/images/")) {
        return trimmed;
    }

    // Formato com prefixo de rota do backend: /media/images?key=...
    if (trimmed.startsWith("/media/images?key=")) {
        const key = trimmed.replace("/media/images?key=", "");
        return `/api/media/images?key=${encodeURIComponent(key)}`;
    }

    // Chave de storage global (ex: "images/2026/09/24/uuid.jpg")
    return `/api/media/images?key=${encodeURIComponent(trimmed)}`;
}
