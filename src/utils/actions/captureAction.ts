import { unstable_rethrow } from 'next/navigation';
import { ZodError } from 'zod';
import { ActionError, type ActionResult } from './actionResult';
import { extractApiErrorMessage, getApiProblem, SESSION_EXPIRED_MESSAGE } from '@/utils/http/apiError';

/** Expected failures are data so Next.js production sanitization cannot erase them. */
export async function captureAction<T>(run: () => Promise<T>): Promise<ActionResult<T>> {
    try {
        return { ok: true, data: await run() };
    } catch (error) {
        // Preserve framework redirects, not-found responses and other control flow.
        unstable_rethrow(error);
        if (error instanceof ActionError) {
            const problem = getApiProblem(error.cause);
            return { ok: false, error: {
                message: extractApiErrorMessage(error, 'Não foi possível concluir a operação.'),
                code: error.code ?? problem?.code ?? (error.message === SESSION_EXPIRED_MESSAGE ? 'SESSION_EXPIRED' : undefined),
                status: error.status ?? problem?.status,
                errors: error.errors ?? problem?.errors,
            } };
        }
        if (error instanceof ZodError) {
            return { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Confira os dados informados e tente novamente.' } };
        }
        // Programming errors and infrastructure details stay on the server.
        console.error('Unexpected Server Action failure:', error);
        return { ok: false, error: { code: 'UNEXPECTED_ERROR', message: 'Ocorreu um erro inesperado. Tente novamente mais tarde.' } };
    }
}
