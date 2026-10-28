import { ActionError,getActionFailure } from '@/utils/http/ActionError';

export const SESSION_EXPIRED_MESSAGE = 'Sua sessão expirou. Faça login novamente.';
const SESSION_INVALID_CODES = new Set(['INVALID_ACCESS_TOKEN', 'AUTHENTICATION_REQUIRED', 'SESSION_INVALID']);
const FALLBACK = 'Não foi possível concluir a operação. Tente novamente.';

export function isApiProblem(value: unknown): value is ApiProblem {
    if (!value || typeof value !== 'object') return false;
    const problem = value as Partial<ApiProblem>;
    return typeof problem.code === 'string' && typeof problem.status === 'number' && typeof problem.detail === 'string';
}

export function getApiProblem(error: unknown): ApiProblem | undefined {
    if (!error || typeof error !== 'object') return undefined;
    if ('rawData' in error && isApiProblem(error.rawData)) return error.rawData;
    if (error instanceof ActionError && error.cause) return getApiProblem(error.cause);
    return undefined;
}

export function isSessionInvalidError(error: unknown): boolean {
    const problem = getApiProblem(error);
    const status = error && typeof error === 'object' && 'status' in error ? error.status : problem?.status;
    // Permission and membership failures never invalidate a session, even with a bad code.
    return status === 401 && !!problem && SESSION_INVALID_CODES.has(problem.code);
}

export function extractApiErrorMessage(error: unknown, fallback = FALLBACK): string {
    const failure = getActionFailure(error);
    if (failure) return failure.message;
    if (error instanceof Error && /API_URL|API_FRONTEND_KEY/.test(error.message)) {
        return 'O serviço está indisponível no momento. Tente novamente mais tarde.';
    }
    if (error instanceof ActionError) return error.message;
    if (error instanceof Error && error.message === SESSION_EXPIRED_MESSAGE) return SESSION_EXPIRED_MESSAGE;
    const problem = getApiProblem(error);
    if (problem) {
        if (Array.isArray(problem.errors)) {
            const message = problem.errors.find(item => typeof item?.message === 'string' && item.message.trim())?.message;
            if (message) return message;
        }
        if (problem.detail.trim()) return problem.detail;
    }
    const codeMessages: Record<string, string> = {
        MEMBERSHIP_PAYMENT_REQUIRED: 'Regularize o pagamento da sua membritude para continuar.',
        MEMBERSHIP_CHARGE_UNAVAILABLE: 'A cobrança da membritude está indisponível. Tente novamente mais tarde.',
        INVALID_CREDENTIALS: 'Os dados informados não conferem. Verifique e tente novamente.',
        INVALID_IMAGE: 'Esta imagem não pôde ser aceita. Escolha uma foto JPEG, PNG ou WebP de até 5 MiB e tente novamente.',
    };
    if (problem && codeMessages[problem.code]) return codeMessages[problem.code];
    const status = error && typeof error === 'object' && 'status' in error ? Number(error.status) : undefined;
    const statusMessages: Record<number, string> = {
        400: 'Confira os dados informados e tente novamente.',
        401: 'Não foi possível autenticar a solicitação. Verifique seus dados e tente novamente.',
        402: codeMessages.MEMBERSHIP_PAYMENT_REQUIRED,
        403: 'Você não tem permissão para realizar esta ação.',
        404: 'Não encontramos o registro solicitado.',
        409: 'Os dados já existem ou foram alterados. Atualize a página e tente novamente.',
        413: 'O arquivo ultrapassa o limite aceito pelo servidor. Reduza o arquivo e tente novamente.',
        415: 'Formato de arquivo não aceito. Confira o arquivo e tente novamente.',
        429: 'Muitas tentativas em pouco tempo. Aguarde um instante e tente novamente.',
        500: 'O servidor encontrou um problema. Tente novamente mais tarde.',
        503: 'O serviço está temporariamente indisponível. Tente novamente mais tarde.',
    };
    if (status && statusMessages[status]) return statusMessages[status];
    if (error instanceof TypeError && /fetch|network/i.test(error.message)) {
        return 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.';
    }
    return fallback;
}

/** Normalization belongs to the HTTP boundary, never to individual actions. */
export function toActionError(error: unknown): ActionError {
    const sessionExpired = error instanceof Error && error.message === SESSION_EXPIRED_MESSAGE;
    if (error instanceof ActionError && !sessionExpired && !/API_URL|API_FRONTEND_KEY/.test(error.message)) return error;
    const problem = getApiProblem(error);
    const status = sessionExpired ? 401 : error && typeof error === 'object' && 'status' in error ? Number(error.status) : problem?.status;
    return new ActionError(extractApiErrorMessage(error), {
        cause: error,
        status,
        code: sessionExpired ? 'SESSION_EXPIRED' : problem?.code ?? (status && status >= 200 && status < 300 ? 'INVALID_RESPONSE' : 'REQUEST_FAILED'),
        errors: Array.isArray(problem?.errors) ? problem.errors.filter(item => item && typeof item.message === 'string' && typeof item.field === 'string' && typeof item.code === 'string') : undefined,
    });
}

export function extractApiErrorCode(error: unknown): string | undefined {
    return getActionFailure(error)?.code ?? getApiProblem(error)?.code;
}
