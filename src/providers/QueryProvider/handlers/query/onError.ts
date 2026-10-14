import { toast } from "react-hot-toast";
import { extractApiErrorMessage, SESSION_EXPIRED_MESSAGE } from "@/utils/http/apiError";

export function queryErrorHandler(error: Error) {

  if (error.message === SESSION_EXPIRED_MESSAGE) {
    toast.error(SESSION_EXPIRED_MESSAGE);
    window.location.href = '/api/auth/logout';
    return;
  }

  // Fallback para outros erros genéricos
  toast.error(extractApiErrorMessage(error, 'Ocorreu um erro inesperado. Tente novamente mais tarde.'));
}