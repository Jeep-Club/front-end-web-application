import { restoreActionError } from '@/utils/http/ActionError';
import { extractApiErrorMessage,SESSION_EXPIRED_MESSAGE } from '@/utils/http/apiError';
import { toast } from 'react-hot-toast';

/** Shared by query and mutation caches; runs before component error callbacks. */
export function httpErrorHandler(error: Error) {
    restoreActionError(error);
    if (error.message === SESSION_EXPIRED_MESSAGE) {
        toast.error(SESSION_EXPIRED_MESSAGE);
        // This is an API route that clears cookies; it requires a full navigation.
        window.location.assign(new URL('/api/auth/logout', window.location.origin));
        return;
    }
    toast.error(extractApiErrorMessage(error, 'Ocorreu um erro inesperado. Tente novamente mais tarde.'));
}
