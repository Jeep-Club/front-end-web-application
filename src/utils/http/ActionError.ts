/** The public part of an expected HTTP or input failure. Never contains the raw response or cause. */
export interface ActionFailure {
    message: string;
    code?: string;
    status?: number;
    errors?: ApiFieldError[];
}

const PREFIX = 'JEEP_API_ERROR_V1:';
const SERVICE_UNAVAILABLE = 'O serviço está indisponível no momento. Tente novamente mais tarde.';

/** Next.js preserves error.digest when it redacts an exception in production. */
export class ActionError extends Error {
    readonly code?: string;
    readonly status?: number;
    readonly errors?: ApiFieldError[];
    readonly digest: string;

    constructor(message: string, options?: ErrorOptions & Partial<ActionFailure>) {
        const cause = getActionFailure(options?.cause);
        const publicMessage = cause?.code === 'SESSION_EXPIRED' ? cause.message
            : /API_URL|API_FRONTEND_KEY/.test(message) ? SERVICE_UNAVAILABLE
            : cause ? `${message} ${cause.message}` : message;
        super(publicMessage, options);
        this.name = 'ActionError';
        this.code = options?.code ?? cause?.code;
        this.status = options?.status ?? cause?.status;
        // Copy only the API's public field-error contract, never arbitrary response properties.
        this.errors = (options?.errors ?? cause?.errors)?.map(({ field, code, message }) => ({ field, code, message }));
        this.digest = PREFIX + encodeURIComponent(JSON.stringify({
            message: this.message, code: this.code, status: this.status, errors: this.errors,
        } satisfies ActionFailure));
    }
}

/** Read only our explicit public contract; opaque framework digests keep their generic message. */
export function getActionFailure(error: unknown): ActionFailure | undefined {
    if (!error || typeof error !== 'object' || !('digest' in error) || typeof error.digest !== 'string' || !error.digest.startsWith(PREFIX)) return;
    try {
        const value: unknown = JSON.parse(decodeURIComponent(error.digest.slice(PREFIX.length)));
        if (!value || typeof value !== 'object') return;
        const failure = value as Partial<ActionFailure>;
        if (typeof failure.message !== 'string' || !failure.message.trim()) return;
        if (failure.code !== undefined && typeof failure.code !== 'string') return;
        if (failure.status !== undefined && (!Number.isInteger(failure.status) || failure.status < 100 || failure.status > 599)) return;
        if (failure.errors !== undefined && (!Array.isArray(failure.errors) || !failure.errors.every(item => item && typeof item.field === 'string' && typeof item.code === 'string' && typeof item.message === 'string'))) return;
        return {
            message: failure.message, code: failure.code, status: failure.status,
            errors: failure.errors?.map(({ field, code, message }) => ({ field, code, message })),
        };
    } catch {
        return;
    }
}

/** Runs once in the global React Query error handlers, before local callbacks and toast rendering. */
export function restoreActionError(error: Error): void {
    const failure = getActionFailure(error);
    if (failure) Object.assign(error, failure);
}
