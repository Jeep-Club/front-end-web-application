import { toast } from "react-hot-toast";
import { extractApiErrorMessage, SESSION_EXPIRED_MESSAGE } from "@/utils/http/apiError";

export function mutationErrorHandler(error: Error, handledLocally = false) {

  if (error.message === SESSION_EXPIRED_MESSAGE) {
    if (!handledLocally) toast.error(SESSION_EXPIRED_MESSAGE);
    window.location.href = '/api/auth/logout';
    return;
  }

  if (handledLocally) return;

  // Fallback para outros erros genéricos
  toast.error(extractApiErrorMessage(error, 'Ocorreu um erro inesperado. Tente novamente mais tarde.'));
}
