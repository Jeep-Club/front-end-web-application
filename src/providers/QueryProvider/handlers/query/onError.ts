import { toast } from "react-hot-toast";

export function queryErrorHandler(error: Error) {


  // Fallback para outros erros genéricos
  toast.error(error.message || 'Ocorreu um erro inesperado. Tente novamente Mais tarde.');
}