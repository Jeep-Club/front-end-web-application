import { toast } from "react-hot-toast";
import { SESSION_EXPIRED_MESSAGE } from "@/utils/http/apiError";

export function mutationErrorHandler(error: Error) {

  if (error.message === SESSION_EXPIRED_MESSAGE) {
    toast.error(SESSION_EXPIRED_MESSAGE);
    window.location.href = '/api/auth/logout';
    return;
  }

  // Fallback para outros erros genéricos
  toast.error(error.message || 'Ocorreu um erro inesperado. Tente novamente Mais tarde.');
}