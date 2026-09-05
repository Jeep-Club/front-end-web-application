export const PUBLICATION_TYPE_LABEL: Record<PublicationType, string> = { event: "Evento", notice: "Aviso", service: "Serviço" };
export const PUBLICATION_STATUS_LABEL: Record<PublicationStatus, string> = { draft: "Rascunho", published: "Publicado", archived: "Arquivado" };
export const NOTICE_PRIORITY_LABEL: Record<NoticePriority, string> = { low: "Baixa", medium: "Média", high: "Alta" };
export const SERVICE_CATEGORY_LABEL: Record<ServiceCategory, string> = { benefit: "Benefício", help: "Ajuda", general: "Geral" };
export const PUBLICATION_STATUS_STYLE: Record<PublicationStatus, string> = {
    draft: "bg-j-yellow-100 text-j-yellow-700", published: "bg-j-green-100 text-j-green-700", archived: "bg-j-gray-200 text-j-gray-700",
};
export const PUBLICATION_TYPE_STYLE: Record<PublicationType, string> = {
    event: "bg-j-blue-100 text-j-blue-800", notice: "bg-j-yellow-100 text-j-yellow-700", service: "bg-j-green-100 text-j-green-700",
};
export function formatPublicationDate(value?: string | null): string {
    return value ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)) : "—";
}

