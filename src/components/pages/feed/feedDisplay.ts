export const feedTypes = {
    NOTICE: { label: "Aviso", plural: "Avisos" },
    EVENT: { label: "Evento", plural: "Eventos" },
    SERVICE: { label: "Serviço", plural: "Serviços" },
};
export function feedDate(value: string) {
    return `${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(value))} (São Paulo)`;
}
import { getActionFailure } from '@/utils/http/ActionError';


/** Reading errors must not turn Membership/permission failures into an empty feed. */
export function publicationReadError(error: unknown) {
    const failure = getActionFailure(error);
    const status = failure?.status;
    const messages: Record<number, string> = {
        400: 'Revise os filtros da publicação.',
        401: 'Não foi possível confirmar sua sessão. Tente novamente.',
        402: 'Acesso restrito pela Membership. Regularize sua situação junto ao clube.',
        403: 'Acesso negado à publicação.',
        404: 'Publicação não encontrada ou indisponível.',
        503: 'O serviço está temporariamente indisponível. Tente novamente mais tarde.',
    };
    return { message: (status && messages[status]) || 'Não foi possível carregar as publicações. Tente novamente.', restricted: status !== undefined && [401, 402, 403, 404].includes(status) };
}

export function publicationReadRetry(failureCount: number, error: unknown) {
    const status = getActionFailure(error)?.status;
    return failureCount < 1 && (status === undefined || status >= 500);
}
