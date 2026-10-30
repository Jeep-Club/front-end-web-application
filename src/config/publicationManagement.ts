import { publicationCreationTypes } from "./publicationCreation";
export const publicationManagementSections = [
    {
        key: "notices",
        route: "notice",
        type: "NOTICE",
        title: "Avisos",
        description: "Gerencie os comunicados do clube, da criação à publicação e ao arquivamento.",
        readActions: ["NOTICE_READ"],
    },
    {
        key: "events",
        route: "event",
        type: "EVENT",
        title: "Eventos",
        description: "Organize eventos, agenda, publicação e regras financeiras; consulte participação e cobranças.",
        readActions: ["EVENT_READ_ADMIN"],
    },
    {
        key: "services",
        route: "service",
        type: "SERVICE",
        title: "Serviços",
        description: "Acompanhe anúncios de serviços e solicitações de publicação e alteração.",
        readActions: ["SERVICE_ADMIN_READ", "SERVICE_REQUEST_ADMIN_READ", "SERVICE_CHANGE_REQUEST_ADMIN_READ"],
    },
];

export const publicationManagementReadActions = publicationManagementSections.flatMap(
    (section) => section.readActions,
);
export const publicationManagementAccessActions = [...publicationManagementReadActions, ...publicationCreationTypes.map((entry) => entry.action)];
