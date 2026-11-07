export const publicationCreationTypes = [
    { type: "EVENT", label: "Evento", action: "EVENT_CREATE", endpoint: "admin/events" },
    { type: "NOTICE", label: "Aviso", action: "NOTICE_CREATE", endpoint: "admin/notices" },
    { type: "SERVICE", label: "Serviço (solicitação)", action: "SERVICE_REQUEST_CREATE", endpoint: "service-publication-requests" },
] as const;