import { getActionFailure, restoreActionError } from '@/utils/http/ActionError';
import { extractApiErrorMessage,SESSION_EXPIRED_MESSAGE } from '@/utils/http/apiError';
import { toast } from 'react-hot-toast';

/** Shared by query and mutation caches; runs before component error callbacks. */
export function httpErrorHandler(error: Error) {
    restoreActionError(error);
    const failure = getActionFailure(error);
    if (failure?.status === 402 && failure.code === 'MEMBERSHIP_PAYMENT_REQUIRED') {
        if (window.location.pathname !== '/financeiro') window.location.assign(new URL('/financeiro', window.location.origin));
        return;
    }
    if (failure?.status === 401 || error.message === SESSION_EXPIRED_MESSAGE) {
        toast.error(SESSION_EXPIRED_MESSAGE);
        // This is an API route that clears cookies; it requires a full navigation.
        window.location.assign(new URL('/api/auth/logout', window.location.origin));
        return;
    }
    toast.error(extractApiErrorMessage(error, 'Ocorreu um erro inesperado. Tente novamente mais tarde.'));
}
