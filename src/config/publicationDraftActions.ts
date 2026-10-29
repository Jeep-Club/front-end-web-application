export const publicationDraftActions = {
    NOTICE: { path: "admin/notices", read: "NOTICE_READ", edit: "NOTICE_UPDATE", publish: "NOTICE_PUBLISH", delete: "NOTICE_DELETE" },
    EVENT: { path: "admin/events", read: "EVENT_READ_ADMIN", edit: "EVENT_UPDATE", publish: "EVENT_PUBLISH", delete: "EVENT_DELETE" },
} as const;