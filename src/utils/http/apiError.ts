/**
 * O fetchWrapper lanca { zodError, rawData, status } quando o corpo da
 * resposta nao bate com o schema de sucesso — e' o caso de qualquer
 * resposta de erro (400/409/...), ja que elas tem um shape diferente.
 * Essa funcao tenta extrair a mensagem real do backend a partir desse
 * objeto, caindo pro fallback generico quando o shape nao e' reconhecido.
 */
export function extractApiErrorMessage(error: unknown, fallback: string): string {
    if (!error || typeof error !== 'object' || !('rawData' in error)) {
        return fallback;
    }

    const rawData = (error as { rawData?: unknown }).rawData;
    if (!rawData || typeof rawData !== 'object') {
        return fallback;
    }

    const validation = rawData as Partial<ApiValidationErrorResponse>;
    if (validation.errors?.length) {
        return validation.errors[0].message;
    }

    const generic = rawData as Partial<ApiErrorResponse>;
    return generic.message || fallback;
}
