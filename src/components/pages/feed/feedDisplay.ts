export const feedTypes = {
    NOTICE: { label: "Aviso", plural: "Avisos" },
    EVENT: { label: "Evento", plural: "Eventos" },
    SERVICE: { label: "Serviço", plural: "Serviços" },
};
export function feedDate(value: string) {
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(value));
}