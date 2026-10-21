import { hasPermission } from "@/utils/permission/hasPermission";

export type PublishedAction = "edit" | "archive" | "cancel" | "finish" | "delete";
export const publicationPublishedActions = {
    NOTICE: { path: "admin/notices", read: "NOTICE_READ", actions: { edit: "NOTICE_UPDATE", archive: "NOTICE_ARCHIVE", delete: "NOTICE_DELETE" } },
    EVENT: { path: "admin/events", read: "EVENT_READ_ADMIN", actions: { edit: "EVENT_UPDATE", cancel: "EVENT_CANCEL", finish: "EVENT_FINISH", delete: "EVENT_DELETE" } },
    SERVICE: { path: "admin/services", read: "SERVICE_ADMIN_READ", actions: { delete: "SERVICE_ADMIN_DELETE" } },
} as const;

export function publishedActionPermission(type: keyof typeof publicationPublishedActions, action: PublishedAction) {
    const actions: Partial<Record<PublishedAction, string>> = publicationPublishedActions[type].actions;
    return actions[action];
}

export function availablePublishedActions(publication: { type: keyof typeof publicationPublishedActions; status: string; eventStatus?: string }, permissions: PermissionModule[]): PublishedAction[] {
    if (publication.status !== "PUBLISHED") return [];
    return (["edit", "archive", "cancel", "finish", "delete"] as const).filter((action) => {
        const permission = publishedActionPermission(publication.type, action);
        if (!permission || !hasPermission(permissions, "PUBLICATIONS", permission)) return false;
        if (action === "cancel") return publication.eventStatus === "OPEN" || publication.eventStatus === "IN_PROGRESS";
        if (action === "finish") return publication.eventStatus === "IN_PROGRESS";
        return true;
    });
}