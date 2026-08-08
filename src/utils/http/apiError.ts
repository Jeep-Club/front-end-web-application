/**
 * Mensagem fixa lancada pelo actionFetchWrapper quando o access token (e o
 * refresh token) nao sao mais validos. Toda action envolve seus erros com
 * extractApiErrorMessage + um fallback proprio, entao precisamos que essa
 * mensagem especifica sobreviva a esse wrapping sem virar o fallback da
 * action — e' o que os handlers globais de erro do QueryProvider usam pra
 * saber quando redirecionar pro login.
 */
export const SESSION_EXPIRED_MESSAGE = 'Sua sessão expirou. Faça login novamente.';

/**
 * Codigos que indicam que o problema e' o access token em si (ausente,
 * invalido ou expirado) — so esses justificam tentar refresh e, se falhar,
 * derrubar a sessao. INVALID_CREDENTIALS (login errado), por exemplo,
 * tambem chega como 401 mas precisa aparecer no formulario, nao derrubar
 * a sessao — por isso a decisao usa `code`, nunca so o `status`.
 */
const SESSION_INVALID_CODES = new Set([
    'INVALID_ACCESS_TOKEN',
    'AUTHENTICATION_REQUIRED',
    'SESSION_INVALID',
]);

/**
 * Reconhece um corpo de erro no formato ApiProblem (RFC 9457). Nao depende
 * do Content-Type da resposta — o fetchWrapper ja faz JSON.parse de
 * qualquer corpo de erro, independente do header.
 */
export function isApiProblem(value: unknown): value is ApiProblem {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const problem = value as Partial<ApiProblem>;
    return typeof problem.code === 'string'
        && typeof problem.status === 'number'
        && typeof problem.detail === 'string';
}

/**
 * O fetchWrapper lanca { rawData, status } quando a resposta HTTP nao e'
 * 2xx (ou { zodError, rawData, status } quando o corpo de sucesso nao bate
 * o schema). Essa funcao extrai o ApiProblem de dentro desse envelope,
 * quando houver um reconhecivel.
 */
export function getApiProblem(error: unknown): ApiProblem | undefined {
    if (!error || typeof error !== 'object' || !('rawData' in error)) {
        return undefined;
    }

    const rawData = (error as { rawData?: unknown }).rawData;
    return isApiProblem(rawData) ? rawData : undefined;
}

/**
 * True quando o erro indica que o access token precisa ser renovado (ou a
 * sessao encerrada) — ver SESSION_INVALID_CODES.
 */
export function isSessionInvalidError(error: unknown): boolean {
    const problem = getApiProblem(error);
    return !!problem && SESSION_INVALID_CODES.has(problem.code);
}

/**
 * Extrai a mensagem pra exibir ao usuario a partir de um erro lancado pelo
 * fetchWrapper, caindo pro fallback generico quando o corpo nao e' um
 * ApiProblem reconhecivel (ex.: falha de rede, HTML de erro 502 etc).
 */
export function extractApiErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message === SESSION_EXPIRED_MESSAGE) {
        return SESSION_EXPIRED_MESSAGE;
    }

    const problem = getApiProblem(error);
    if (!problem) {
        return fallback;
    }

    if (problem.errors?.length) {
        return problem.errors[0].message;
    }

    return problem.detail || fallback;
}

/**
 * Extrai o `code` estavel do backend, pra decisoes programaticas que nao
 * devem depender de texto traduzido (ex.: distinguir ACCESS_DENIED de
 * outros 403, ou tratar codigos de negocio especificos por tela).
 */
export function extractApiErrorCode(error: unknown): string | undefined {
    return getApiProblem(error)?.code;
}
